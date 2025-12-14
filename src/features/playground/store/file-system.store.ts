import { create } from 'zustand';
import { enableMapSet } from 'immer';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMeta, isDir, makeDirNode, makeFileNode } from '../lib';
import type { FsNode, Ino, InodeMeta, ResolveResult } from '../types';
import { deserializeFsTree, serializeFsTree } from './file-system/fs-tree-serialization';
import { META_KEY } from './file-system/constants';
import { coerceInodeMeta, wrapMeta } from './file-system/inode-meta';

export { META_KEY };

enableMapSet();

export function resolvePath(path: string, fsTreeParam?: Map<string, FsNode>): ResolveResult {
    const fsTree = fsTreeParam ?? useFileSystem.getState().fsTree;
    const parts = path.split('/').filter(Boolean);

    // root
    let node = fsTree.get('/');
    if (!node) {
        return { kind: 'missing', at: '/' };
    }

    // special case: "/"
    if (parts.length === 0) {
        return { kind: 'found', node, meta: getMeta(node) };
    }

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (!isDir(node)) {
            return { kind: 'missing', at: parts.slice(0, i).join('/') };
        }

        const next = node.get(part);
        if (!next) {
            return { kind: 'missing', at: parts.slice(0, i + 1).join('/') };
        }

        if (next instanceof Map) {
            node = next as FsNode;
            continue;
        }

        const meta = coerceInodeMeta(next);
        if (meta) {
            if (i < parts.length - 1) {
                return { kind: 'missing', at: parts.slice(0, i + 1).join('/') };
            }
            return { kind: 'found', node: wrapMeta(meta), meta };
        }

        return { kind: 'missing', at: parts.slice(0, i + 1).join('/') };
    }

    return { kind: 'found', node, meta: getMeta(node) };
}

export function resolveFilename(path: string) {
    const parts = path.split('/').filter(Boolean);
    return parts.length === 0 ? null : parts[parts.length - 1];
}

export function getDirEntries(node: FsNode) {
    if (!(node instanceof Map)) return [];

    const outDirs: Array<[string, FsNode]> = [];
    const outFiles: Array<[string, FsNode]> = [];

    for (const [key, value] of node.entries()) {
        if (key === META_KEY) continue;
        if (typeof key !== 'string') continue;

        if (value instanceof Map) {
            const meta = getMeta(value);
            if (meta.type === 'dir') {
                outDirs.push([key, value]);
            } else {
                outFiles.push([key, value]);
            }
            continue;
        }
    }
    return [...outDirs.sort(), ...outFiles.sort()];
}

export function buildPath(parentPath: string, name: string) {
    if (parentPath === '/') return `/${name}`;
    return `${parentPath}/${name}`;
}

function splitPath(path: string): { parentPath: string; name: string } | null {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name) return null;
    const parentPath = parts.length === 0 ? '/' : `/${parts.join('/')}`;
    return { parentPath, name };
}

function computeNextIno(fsTree: Map<string, FsNode>): Ino {
    let max = 0;

    const walk = (node: FsNode) => {
        const meta = getMeta(node);
        max = Math.max(max, meta.ino);
        for (const [key, value] of node.entries()) {
            if (key === META_KEY) continue;
            if (value instanceof Map) {
                walk(value as FsNode);
                continue;
            }
            const m = coerceInodeMeta(value);
            if (m) max = Math.max(max, m.ino);
        }
    };

    for (const [, root] of fsTree.entries()) walk(root);

    return (max + 1) as Ino;
}

export const pathIndexed = new Map<string, boolean>();
export const renderedPathsIndex = pathIndexed;

/** ---- state ---- */

type FileSystemState = {
    fsTree: Map<string, FsNode>;
    nextIno: Ino;
    activeFile: string | null;
    openFiles: Set<string>; // set of file paths

    allocateIno: () => Ino;
    setActiveFile: (path: string | null) => void;
    setActiveFilePath: (path: string | null) => void;
    addOpenFiles: (path: string) => void;
    openFile: (path: string) => void;
    closeOpenFile: (path: string) => void;
    closeFile: (path: string) => void;
    closeAllOpenFiles: () => void;
    closeAllFiles: () => void;
    createFile: (path: string, filename: string) => void;
    createDir: (path: string, dirname: string) => void;
    renameNode: (path: string, newName: string) => void;
    deleteNode: (path: string) => void;
};

type OpenFilesDraft = {
    openFiles: Set<string>;
    activeFile: string | null;
};

function closeFileInState(state: OpenFilesDraft, path: string) {
    state.openFiles.delete(path);
    if (state.activeFile !== path) return;

    if (state.openFiles.size > 0) {
        state.activeFile = Array.from(state.openFiles)[0];
    } else {
        state.activeFile = null;
    }
}

/** ---- root creation ---- */

const defaultFsTree = new Map<string, FsNode>([
    [
        '/',
        new Map()
            .set(META_KEY, makeDirNode(0 as Ino))
            .set(
                'src',
                new Map()
                    .set(META_KEY, makeDirNode(1 as Ino))
                    .set('server.ts', new Map().set(META_KEY, makeFileNode(3 as Ino))),
            )
            .set('index.ts', new Map().set(META_KEY, makeFileNode(2 as Ino))),
    ],
]);

/** ---- store ---- */
export const useFileSystem = create<FileSystemState>()(
    persist(
        immer((set, get) => {
            const setActiveFilePath = (path: string | null) => {
                set(state => {
                    state.activeFile = path;
                });
            };

            const openFile = (path: string) => {
                set(state => {
                    state.openFiles.add(path);
                });
            };

            const closeFile = (path: string) => {
                set(state => {
                    closeFileInState(state, path);
                });
            };

            const closeAllFiles = () => {
                set(state => {
                    state.openFiles.clear();
                    state.activeFile = null;
                });
            };

            const createNodeInDirectory = (
                state: { fsTree: Map<string, FsNode>; nextIno: Ino },
                directoryPath: string,
                name: string,
                createMeta: (ino: Ino) => InodeMeta,
            ) => {
                const res = resolvePath(directoryPath, state.fsTree);
                if (res.kind !== 'found') return;
                if (!isDir(res.node)) return;
                if (res.node.has(name)) return;

                const ino = state.nextIno;
                state.nextIno = (ino + 1) as Ino;
                res.node.set(name, new Map().set(META_KEY, createMeta(ino)));
            };

            const resolveParentDirectory = (
                state: { fsTree: Map<string, FsNode> },
                path: string,
            ): { dir: FsNode; name: string } | null => {
                const split = splitPath(path);
                if (!split) return null;
                const { parentPath, name } = split;

                const res = resolvePath(parentPath, state.fsTree);
                if (res.kind !== 'found') return null;
                if (!isDir(res.node)) return null;

                return { dir: res.node, name };
            };

            return {
                fsTree: defaultFsTree,
                nextIno: computeNextIno(defaultFsTree),
                activeFile: null,
                openFiles: new Set<string>(),

                allocateIno: () => {
                    const ino = get().nextIno;
                    set(state => {
                        state.nextIno = (ino + 1) as Ino;
                    });
                    return ino;
                },

                setActiveFile: setActiveFilePath,
                setActiveFilePath,

                addOpenFiles: openFile,
                openFile,

                closeOpenFile: closeFile,
                closeFile,

                closeAllOpenFiles: closeAllFiles,
                closeAllFiles,

                createFile: (path, filename) => {
                    set(state => {
                        createNodeInDirectory(state, path, filename, makeFileNode);
                    });
                },
                createDir: (path, dirname) => {
                    set(state => {
                        createNodeInDirectory(state, path, dirname, makeDirNode);
                    });
                },
                renameNode: (path, newName) => {
                    set(state => {
                        const resolved = resolveParentDirectory(state, path);
                        if (!resolved) return;
                        const { dir, name } = resolved;

                        if (!dir.has(name)) return;
                        if (dir.has(newName)) return;

                        const node = dir.get(name);
                        if (!node) return;
                        dir.delete(name);
                        dir.set(newName, node);
                    });
                },

                deleteNode: path => {
                    set(state => {
                        const resolved = resolveParentDirectory(state, path);
                        if (!resolved) return;
                        const { dir, name } = resolved;
                        dir.delete(name);
                    });
                },
            };
        }),
        {
            name: 'file-system-storage',
            storage: createJSONStorage(() => localStorage),
            merge: (persistedState, currentState) => {
                if (!persistedState) return currentState;

                const persisted = persistedState as unknown as Partial<{
                    fsTree: unknown;
                    nextIno: unknown;
                    activeFile: unknown;
                    openFiles: unknown;
                }>;

                const fsTree =
                    Array.isArray(persisted.fsTree) && persisted.fsTree.length > 0
                        ? deserializeFsTree(persisted.fsTree)
                        : currentState.fsTree;

                const openFiles = new Set<string>(
                    Array.isArray(persisted.openFiles) ? (persisted.openFiles as unknown as string[]) : [],
                );

                const nextIno = typeof persisted.nextIno === 'number' ? persisted.nextIno : currentState.nextIno;

                const activeFile =
                    typeof persisted.activeFile === 'number' ? persisted.activeFile : currentState.activeFile;

                return {
                    ...currentState,
                    ...persistedState,
                    fsTree,
                    openFiles,
                    nextIno,
                    activeFile,
                } as FileSystemState;
            },
            partialize: state => ({
                fsTree: serializeFsTree(state.fsTree),
                nextIno: state.nextIno,
                activeFile: state.activeFile,
                openFiles: Array.from(state.openFiles),
            }),
        },
    ),
);

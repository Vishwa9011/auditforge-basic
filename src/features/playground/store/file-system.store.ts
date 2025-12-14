import { create } from 'zustand';
import { enableMapSet } from 'immer';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FsNode, Ino } from '../types';
import {
    META_KEY,
    computeNextIno,
    deserializeFsTree,
    isDir,
    makeDirNode,
    makeFileNode,
    resolvePath,
    serializeFsTree,
    splitPath,
} from './file-system';

enableMapSet();

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
            const setActiveFile = (path: string | null) => {
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
                    state.openFiles.delete(path);
                    if (state.activeFile === path) {
                        if (state.openFiles.size > 0) {
                            state.activeFile = Array.from(state.openFiles)[0];
                        } else {
                            state.activeFile = null;
                        }
                    }
                });
            };

            const closeAllFiles = () => {
                set(state => {
                    state.openFiles.clear();
                    state.activeFile = null;
                });
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

                setActiveFile,
                setActiveFilePath: setActiveFile,

                addOpenFiles: openFile,
                openFile,

                closeOpenFile: closeFile,
                closeFile,

                closeAllOpenFiles: closeAllFiles,
                closeAllFiles,

                createFile: (path, filename) => {
                    set(state => {
                        const res = resolvePath(path, state.fsTree);
                        if (res.kind !== 'found') return;
                        if (!isDir(res.node)) return;
                        if (res.node.has(filename)) return;

                        const ino = state.nextIno;
                        state.nextIno = (ino + 1) as Ino;
                        res.node.set(filename, new Map().set(META_KEY, makeFileNode(ino)));
                    });
                },
                createDir: (path, dirname) => {
                    set(state => {
                        const res = resolvePath(path, state.fsTree);
                        if (res.kind !== 'found') return;
                        if (!isDir(res.node)) return;
                        if (res.node.has(dirname)) return;

                        const ino = state.nextIno;
                        state.nextIno = (ino + 1) as Ino;
                        res.node.set(dirname, new Map().set(META_KEY, makeDirNode(ino)));
                    });
                },
                renameNode: (path, newName) => {
                    set(state => {
                        const split = splitPath(path);
                        if (!split) return;
                        const { parentPath, name } = split;

                        const res = resolvePath(parentPath, state.fsTree);
                        if (res.kind !== 'found') return;
                        if (!isDir(res.node)) return;
                        if (!res.node.has(name)) return;
                        if (res.node.has(newName)) return;

                        const node = res.node.get(name);
                        if (!node) return;
                        res.node.delete(name);
                        res.node.set(newName, node);
                    });
                },

                deleteNode: path => {
                    set(state => {
                        const split = splitPath(path);
                        if (!split) return;
                        const { parentPath, name } = split;

                        const res = resolvePath(parentPath, state.fsTree);
                        if (res.kind !== 'found') return;
                        if (!isDir(res.node)) return;
                        res.node.delete(name);
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

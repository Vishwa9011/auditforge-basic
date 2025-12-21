import { create } from 'zustand';
import { enableMapSet } from 'immer';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FsNode, Ino, InodeMeta } from '@features/playground/types';
import {
    DEFAULT_CWD,
    DEFAULT_WORKSPACE,
    META_KEY,
    computeNextIno,
    deserializeFsTree,
    getWorkspaceNames,
    isDir,
    makeDirNode,
    makeFileNode,
    resolvePath,
    serializeFsTree,
    splitPath,
} from '@features/playground/store/file-system';

enableMapSet();

/** ---- state ---- */

type FileSystemState = {
    cwd: string;
    fsTree: Map<string, FsNode>;
    nextIno: Ino;
    activeFile: string | null;
    openFiles: Set<string>; // set of file paths
    selectedWorkspace: string | null;
    isWorkspaceInitialized: boolean;

    selectWorkspace: (name: string) => void;
    allocateIno: () => Ino;
    setActiveFile: (path: string | null) => void;
    /**
     * Open a file in the editor tabs and set it as active.
     */
    openFile: (path: string) => void;
    closeFile: (path: string) => void;
    closeAllFiles: () => void;
    createFile: (path: string, filename: string) => void;
    createDir: (path: string, dirname: string) => void;
    renameNode: (path: string, newName: string) => void;
    deleteNode: (path: string) => void;
    updateFileStats: (path: string, newSize: number) => void;
    setWorkspaceInitialized: (initialized: boolean) => void;
};

// Default workspace structure
const defaultWorkspaceValue = new Map().set(
    '/',
    new Map()
        .set(META_KEY, makeDirNode(0 as Ino))
        .set(
            '.workspaces',
            new Map()
                .set(META_KEY, makeDirNode(1 as Ino))
                .set(DEFAULT_WORKSPACE, new Map().set(META_KEY, makeDirNode(2 as Ino))),
        ),
);

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
                    state.activeFile = path;
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
                cwd: DEFAULT_CWD,
                selectedWorkspace: DEFAULT_WORKSPACE,
                fsTree: defaultWorkspaceValue,
                nextIno: computeNextIno(defaultWorkspaceValue),
                activeFile: null,
                openFiles: new Set<string>(),
                isWorkspaceInitialized: false,

                setWorkspaceInitialized: (initialized: boolean) => {
                    set(state => {
                        state.isWorkspaceInitialized = initialized;
                    });
                },

                allocateIno: () => {
                    const ino = get().nextIno;
                    set(state => {
                        state.nextIno = (ino + 1) as Ino;
                    });
                    return ino;
                },

                setActiveFile,

                openFile,

                closeFile,

                closeAllFiles,

                selectWorkspace: (name: string) => {
                    const workspaceNames = getWorkspaceNames(get().fsTree);
                    if (!workspaceNames.includes(name)) return;
                    set(state => {
                        state.cwd = `/.workspaces/${name}`;
                        state.selectedWorkspace = name;
                    });
                },

                createFile: (path, filename) => {
                    set(state => {
                        const res = resolvePath(path, state.fsTree);
                        if (res.kind !== 'found') return;
                        if (!isDir(res.node)) return;
                        if (res.node.has(filename)) return;

                        const ino = state.nextIno;
                        state.nextIno = (ino + 1) as Ino;
                        res.node.set(filename, new Map().set(META_KEY, makeFileNode(get().nextIno)));
                    });
                },
                createDir: (path, dirname) => {
                    set(state => {
                        const res = resolvePath(path, state.fsTree);
                        if (res.kind !== 'found') return false;
                        if (!isDir(res.node)) return false;
                        if (res.node.has(dirname)) return false;

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

                updateFileStats: (path, newSize: number) => {
                    set(state => {
                        const res = resolvePath(path, state.fsTree);
                        if (res.kind !== 'found') return;
                        if (isDir(res.node)) return;

                        const meta = res.node.get(META_KEY) as InodeMeta;
                        meta.size = newSize;
                        meta.mtimeMs = Date.now();
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
                    typeof persisted.activeFile === 'string' ? persisted.activeFile : currentState.activeFile;

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
                cwd: state.cwd,
                nextIno: state.nextIno,
                activeFile: state.activeFile,
                openFiles: Array.from(state.openFiles),
                selectedWorkspace: state.selectedWorkspace,
                isWorkspaceInitialized: state.isWorkspaceInitialized,
            }),
        },
    ),
);

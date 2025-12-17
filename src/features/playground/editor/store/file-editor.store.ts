import { create } from 'zustand';
import type { Ino } from '@features/playground/types';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

enableMapSet();

type FileEditorStoreState = {
    currentFileContent: string | null;
    draftsByIno: Map<
        Ino,
        {
            path: string;
            ino: Ino;
            content: string;
            updatedAtMs: number;
        }
    >;
    unsavedInos: Set<Ino>;
    upsertDraftContent: (ino: Ino, content: string, path?: string) => void;
    markUnsaved: (ino: Ino) => void;
    clearUnsaved: (ino: Ino) => void;
    clearAllUnsaved: () => void;
    setCurrentFileContent: (content: string | null) => void;
};

export const useFileEditorStore = create<FileEditorStoreState>()(
    immer(set => ({
        currentFileContent: null,
        draftsByIno: new Map(),
        unsavedInos: new Set(),
        markUnsaved: (ino: Ino) => {
            set(state => {
                state.unsavedInos.add(ino);
            });
        },

        clearUnsaved: (ino: Ino) => {
            set(state => {
                state.unsavedInos.delete(ino);
            });
        },
        clearAllUnsaved: () => {
            set(state => {
                state.unsavedInos.clear();
            });
        },
        upsertDraftContent: (ino: Ino, content: string, path?: string) => {
            set(state => {
                const existing = state.draftsByIno.get(ino);
                if (existing) {
                    existing.content = content;
                    existing.updatedAtMs = Date.now();
                    if (path) {
                        existing.path = path;
                    }
                    state.draftsByIno.set(ino, existing);
                } else {
                    state.draftsByIno.set(ino, {
                        path: path || `untitled-${ino}`,
                        ino,
                        updatedAtMs: Date.now(),
                        content,
                    });
                }
            });
        },
        setCurrentFileContent: (content: string | null) => {
            set(state => {
                state.currentFileContent = content;
            });
        },
    })),
);

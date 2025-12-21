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
            size: number;
            mtimeMs: number;
        }
    >;
    unsavedInos: Set<Ino>;
    upsertDraftContent: (ino: Ino, content: string, path: string) => void;
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
                state.draftsByIno.delete(ino);
            });
        },
        clearAllUnsaved: () => {
            set(state => {
                state.unsavedInos.clear();
                state.draftsByIno.clear();
            });
        },
        upsertDraftContent: (ino: Ino, content: string, path: string) => {
            set(state => {
                const existing = state.draftsByIno.get(ino);
                if (existing) {
                    existing.content = content;
                    existing.mtimeMs = Date.now();
                    existing.size = new TextEncoder().encode(content).length;
                    state.draftsByIno.set(ino, existing);
                } else {
                    state.draftsByIno.set(ino, {
                        path: path,
                        ino,
                        mtimeMs: Date.now(),
                        content,
                        size: new TextEncoder().encode(content).length,
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

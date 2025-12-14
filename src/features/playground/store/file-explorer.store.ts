import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FileExplorerStoreState = {
    contentByFilePath: Record<string, string>;
    updateFileContent: (filePath: string, content: string) => void;
    getFileContent: (filePath: string) => string;
};

export const useFileExplorerStore = create<FileExplorerStoreState>()(
    persist(
        (set, get) => ({
            contentByFilePath: {},
            updateFileContent: (filePath, content) => {
                set(state => ({
                    contentByFilePath: {
                        ...state.contentByFilePath,
                        [filePath]: content,
                    },
                }));
            },
            getFileContent: filePath => get().contentByFilePath[filePath] ?? '',
        }),
        {
            name: 'file-explorer-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);


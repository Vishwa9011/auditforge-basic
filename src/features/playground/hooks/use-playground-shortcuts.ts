import { useMemo } from 'react';
import { useUiToggle } from './use-ui-toggle';
import { useFileEditorStore, useFileSystem, usePgUiToggle } from '@features/playground/store';
import { APP_SHORTCUT_IDS } from '@/lib/app-shortcuts';
import { useShortcutActions } from '@/hooks/use-shortcut-actions';
import { saveActiveFile, saveAllUnsavedFiles } from '../lib';
import { resolvePath } from '../store/file-system';

export function usePlaygroundShortcuts() {
    const { toggle: toggleOpenFile } = useUiToggle('open-file-command-dialog');
    const { toggle: toggleFileExplorer } = useUiToggle('file-explorer-panel');
    const { toggle: toggleAiAnalysis } = useUiToggle('analyzer-panel');
    const { toggle: toggleCloseAllFilesDialog } = useUiToggle('close-all-files-dialog');

    const actions = useMemo(
        () => ({
            [APP_SHORTCUT_IDS.NEW_FILE]: () => useFileSystem.getState(),
            [APP_SHORTCUT_IDS.OPEN_FILE]: () => toggleOpenFile(true),
            [APP_SHORTCUT_IDS.OPEN_FILE_EXPLORER]: () => toggleFileExplorer(),
            [APP_SHORTCUT_IDS.OPEN_AI_ANALYSIS]: () => toggleAiAnalysis(),
            [APP_SHORTCUT_IDS.CLOSE_FILE]: () => {
                const { activeFile, closeFile } = useFileSystem.getState();
                if (!activeFile) return;
                const res = resolvePath(activeFile);
                if (res.kind == 'found') {
                    const hasUnsavedChanges = useFileEditorStore.getState().unsavedInos.has(res.meta.ino);
                    if (hasUnsavedChanges) {
                        usePgUiToggle.getState().toggle(`close-file-dialog-${res.meta.ino}`, true);
                        return;
                    }
                }
                closeFile(activeFile);
            },
            [APP_SHORTCUT_IDS.CLOSE_ALL_FILES]: () => {
                const unSavedCount = useFileEditorStore.getState().unsavedInos.size;
                if (unSavedCount > 0) return toggleCloseAllFilesDialog(true);
                useFileSystem.getState().closeAllFiles();
            },
            [APP_SHORTCUT_IDS.SAVE_FILE]: saveActiveFile,
            [APP_SHORTCUT_IDS.SAVE_ALL_FILES]: saveAllUnsavedFiles,
        }),
        [toggleAiAnalysis, toggleFileExplorer, toggleOpenFile],
    );

    useShortcutActions(actions);
}

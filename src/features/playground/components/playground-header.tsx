import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUiToggle } from '@features/playground/hooks';
import { Bot, Loader2, Save, SaveAll, Sidebar } from 'lucide-react';
import { resolvePath } from '@features/playground/store/file-system';
import { saveAllUnsavedFiles, saveFileByIno } from '@features/playground/lib';
import { useFileEditorStore, useFileSystem } from '@features/playground/store';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { APP_SHORTCUT_IDS } from '@/lib/app-shortcuts';

const actionButtonClasses =
    'h-7 gap-1.5 rounded-lg bg-muted/40 px-2 text-xs shadow-none hover:bg-muted/60 hover:text-foreground';

type SavingMode = 'none' | 'active-file' | 'all-files';

export function PlaygroundHeader() {
    const [savingMode, setSavingMode] = useState<SavingMode>('none');
    const isSavingActiveFile = savingMode === 'active-file';
    const isSavingAllFiles = savingMode === 'all-files';
    const isSaving = savingMode !== 'none';

    const fileTree = useFileSystem(state => state.fsTree);
    const activeFilePath = useFileSystem(state => state.activeFile);

    const analyzerPanel = useUiToggle('analyzer-panel');
    const explorerPanel = useUiToggle('file-explorer-panel');

    const unsavedFileInos = useFileEditorStore(state => state.unsavedInos);

    const activeFileIno = useMemo(() => {
        if (!activeFilePath) return null;
        const resolved = resolvePath(activeFilePath, fileTree);
        return resolved.kind === 'found' ? resolved.meta.ino : null;
    }, [activeFilePath, fileTree]);

    const hasActiveFileUnsavedChanges = activeFileIno !== null ? unsavedFileInos.has(activeFileIno) : false;
    const hasUnsavedChanges = unsavedFileInos.size > 0;

    const handleToggleAnalyzerPanel = () => {
        if (explorerPanel.isEnabled && !analyzerPanel.isEnabled) {
            explorerPanel.toggle(false);
            analyzerPanel.toggle(true);
            return;
        }

        analyzerPanel.toggle();
    };

    const handleSaveActiveFile = async () => {
        if (activeFileIno === null) return;
        if (isSaving) return;
        setSavingMode('active-file');
        try {
            await saveFileByIno(activeFileIno);
        } finally {
            setSavingMode('none');
        }
    };

    const handleSaveAllFiles = async () => {
        if (isSaving) return;
        setSavingMode('all-files');
        try {
            await saveAllUnsavedFiles();
        } finally {
            setSavingMode('none');
        }
    };

    useEffect(() => {
        if (!activeFilePath && analyzerPanel.isEnabled) {
            analyzerPanel.toggle(false);
        }
    }, [activeFilePath, analyzerPanel.isEnabled]);

    return (
        <header className="bg-background">
            <div className="flex h-10 items-center justify-between border-b px-2">
                <ShortcutTooltip label="Toggle sidebar" shortcutId={APP_SHORTCUT_IDS.OPEN_FILE_EXPLORER}>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8"
                        aria-label="Toggle sidebar"
                        onClick={() => explorerPanel.toggle()}
                    >
                        <Sidebar className="size-4" />
                    </Button>
                </ShortcutTooltip>

                <div className="flex h-full shrink-0 items-center px-2">
                    <div className="flex items-center gap-1.5">
                        <ShortcutTooltip
                            label={hasActiveFileUnsavedChanges ? 'Save' : 'No changes to save'}
                            shortcutId={APP_SHORTCUT_IDS.SAVE_FILE}
                            sideOffset={0}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className={actionButtonClasses}
                                disabled={!hasActiveFileUnsavedChanges || isSaving}
                                onClick={handleSaveActiveFile}
                                aria-label="Save"
                            >
                                {isSavingActiveFile ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Save className="size-3.5" />
                                )}
                                <span className="sr-only">Save</span>
                            </Button>
                        </ShortcutTooltip>

                        <ShortcutTooltip
                            label={hasUnsavedChanges ? 'Save all' : 'No changes to save'}
                            shortcutId={APP_SHORTCUT_IDS.SAVE_ALL_FILES}
                            sideOffset={0}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className={actionButtonClasses}
                                disabled={!hasUnsavedChanges || isSaving}
                                onClick={handleSaveAllFiles}
                                aria-label="Save all"
                            >
                                {isSavingAllFiles ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <SaveAll className="size-3.5" />
                                )}
                                <span className="sr-only">Save all</span>
                                <span>All</span>
                            </Button>
                        </ShortcutTooltip>

                        <ShortcutTooltip
                            label={activeFilePath ? 'Analyze' : 'Select a file to analyze'}
                            shortcutId={APP_SHORTCUT_IDS.OPEN_AI_ANALYSIS}
                            sideOffset={0}
                        >
                            <Button
                                type="button"
                                variant="outline"
                                className={actionButtonClasses}
                                disabled={!activeFilePath}
                                aria-label="Analyze"
                                onClick={handleToggleAnalyzerPanel}
                            >
                                <Bot className="size-3.5" />
                                <span>Analyze</span>
                                {hasUnsavedChanges ? <span className="bg-destructive size-1.5 rounded-full" /> : null}
                            </Button>
                        </ShortcutTooltip>
                    </div>
                </div>
            </div>
        </header>
    );
}

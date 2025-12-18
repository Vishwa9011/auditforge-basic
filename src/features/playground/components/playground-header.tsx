import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUiToggle } from '@features/playground/hooks';
import { Bot, Loader2, Save, SaveAll, Sidebar } from 'lucide-react';
import { resolvePath } from '@features/playground/store/file-system';
import { saveAllUnsavedFiles, saveFileByIno } from '@features/playground/lib';
import { useFileEditorStore, useFileSystem } from '@features/playground/store';

export function PlaygroundHeader() {
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);

    const fsTree = useFileSystem(state => state.fsTree);
    const activeFile = useFileSystem(state => state.activeFile);
    const toggleAnalyzer = useUiToggle('analyzer-panel').toggle;
    const toggleExplorer = useUiToggle('file-explorer-panel').toggle;

    const unsavedInos = useFileEditorStore(state => state.unsavedInos);

    const activeMeta = useMemo(() => {
        if (!activeFile) return null;
        const resolved = resolvePath(activeFile, fsTree);
        return resolved.kind === 'found' ? resolved.meta : null;
    }, [activeFile, fsTree]);

    const hasActiveUnsavedChanges = activeMeta ? unsavedInos.has(activeMeta.ino) : false;
    const hasAnyUnsavedChanges = unsavedInos.size > 0;

    const saveActiveFile = async () => {
        if (!activeMeta) return;
        setIsSaving(true);
        try {
            await saveFileByIno(activeMeta.ino);
        } finally {
            setIsSaving(false);
        }
    };

    const saveAllFiles = async () => {
        setIsSavingAll(true);
        try {
            await saveAllUnsavedFiles();
        } finally {
            setIsSavingAll(false);
        }
    };

    const actionButtonClass =
        'h-7 gap-1.5 rounded-lg bg-muted/40 px-2 text-xs shadow-none hover:bg-muted/60 hover:text-foreground';

    return (
        <header className="bg-background ">
            <div className="flex h-10 items-center justify-between border-b px-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8"
                    title="Toggle sidebar"
                    aria-label="Toggle sidebar"
                    onClick={() => toggleExplorer()}
                >
                    <Sidebar className="size-4" />
                </Button>

                <div className="flex h-full shrink-0 items-center px-2">
                    <div className="flex items-center gap-1.5">
                        <Button
                            type="button"
                            variant="outline"
                            className={actionButtonClass}
                            disabled={!hasActiveUnsavedChanges || isSaving || isSavingAll}
                            onClick={saveActiveFile}
                            title={hasActiveUnsavedChanges ? 'Save' : 'No changes to save'}
                            aria-label="Save"
                        >
                            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                            <span className="sr-only">Save</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className={actionButtonClass}
                            disabled={!hasAnyUnsavedChanges || isSaving || isSavingAll}
                            onClick={saveAllFiles}
                            title={hasAnyUnsavedChanges ? 'Save all' : 'No changes to save'}
                            aria-label="Save all"
                        >
                            {isSavingAll ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <SaveAll className="size-3.5" />
                            )}
                            <span className="sr-only">Save all</span>
                            <span>All</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className={actionButtonClass}
                            disabled={!activeFile}
                            title={activeFile ? 'Analyze' : 'Select a file to analyze'}
                            aria-label="Analyze"
                            onClick={() => toggleAnalyzer()}
                        >
                            <Bot className="size-3.5" />
                            <span>Analyze</span>
                            {hasAnyUnsavedChanges ? <span className="bg-destructive size-1.5 rounded-full" /> : null}
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

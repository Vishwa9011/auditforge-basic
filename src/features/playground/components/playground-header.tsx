import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useFileExplorerStore, useFileSystem } from '../store';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Save, SaveAll, Sidebar } from 'lucide-react';
import type { InodeMeta } from '../types';
import { resolveFilename, resolvePath } from '../store/file-system';
import { CloseFileButton } from './dialogs/close-file-button';
import { CloseAllFilesButton } from './dialogs/close-all-files-button';
import { useSidebarStore } from '../store/sidebar.store';
import { writeFileContent } from '../lib';

export function PlaygroundHeader() {
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);

    const openFiles = useFileSystem(state => state.openFiles);
    const activeFile = useFileSystem(state => state.activeFile);
    const setActiveFile = useFileSystem(state => state.setActiveFile);
    const toggleSidebar = useSidebarStore(state => state.toggleSidebar);

    const draftsByIno = useFileExplorerStore(state => state.draftsByIno);
    const unsavedInos = useFileExplorerStore(state => state.unsavedInos);
    const clearUnsaved = useFileExplorerStore(state => state.clearUnsaved);

    const openFileTabs = useMemo(() => {
        const tabs: Array<InodeMeta & { path: string; name: string }> = [];

        for (const filePath of openFiles) {
            const resolved = resolvePath(filePath);
            if (resolved.kind !== 'found') continue;
            tabs.push({
                ...resolved.meta,
                path: filePath,
                name: resolveFilename(filePath) || 'untitled',
            });
        }

        return tabs;
    }, [openFiles]);

    const activeMeta = useMemo(() => {
        if (!activeFile) return null;
        const resolved = resolvePath(activeFile);
        return resolved.kind === 'found' ? resolved.meta : null;
    }, [activeFile]);

    const hasActiveUnsavedChanges = activeMeta ? unsavedInos.has(activeMeta.ino) : false;
    const hasAnyUnsavedChanges = unsavedInos.size > 0;

    const saveActiveFile = async () => {
        if (!activeMeta) return;
        const draft = draftsByIno.get(activeMeta.ino);
        if (!draft) return;

        setIsSaving(true);
        try {
            await writeFileContent(activeMeta.ino, draft.content);
            clearUnsaved(activeMeta.ino);
        } finally {
            setIsSaving(false);
        }
    };

    const saveAllFiles = async () => {
        const inos = Array.from(unsavedInos);
        if (inos.length === 0) return;

        setIsSavingAll(true);
        try {
            for (const ino of inos) {
                const draft = draftsByIno.get(ino);
                if (!draft) continue;
                await writeFileContent(ino, draft.content);
                clearUnsaved(ino);
            }
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
                    onClick={() => toggleSidebar()}
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
                        >
                            <Bot className="size-3.5" />
                            <span>Analyze</span>
                            {hasAnyUnsavedChanges ? <span className="bg-destructive size-1.5 rounded-full" /> : null}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex h-8 items-center overflow-x-hidden border-b">
                <div className="h-full min-w-0 flex-1">
                    <div
                        role="tablist"
                        aria-label="Open files"
                        className="scroll-thin flex h-full min-w-0 items-center overflow-x-auto overflow-y-hidden"
                    >
                        {openFileTabs.map(file => {
                            const isActive = file.path === activeFile;
                            return (
                                <div
                                    key={file.path}
                                    className={cn(
                                        'group relative flex h-full cursor-pointer items-center gap-2 border-r pr-2 pl-3 whitespace-nowrap',
                                        isActive ? 'bg-accent/50 text-foreground' : 'text-muted-foreground',
                                    )}
                                    onClick={() => setActiveFile(file.path)}
                                    role="tab"
                                    aria-selected={isActive}
                                    tabIndex={0}
                                    onKeyDown={event => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            setActiveFile(file.path);
                                        }
                                    }}
                                >
                                    <span className={cn('max-w-[12rem] truncate text-xs', isActive && 'font-semibold')}>
                                        {file.name}
                                    </span>
                                    <CloseFileButton {...file} />
                                    {isActive && <span className="bg-primary absolute inset-x-0 bottom-0 h-0.5" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex h-full shrink-0 items-center gap-1 border-l px-2">
                    <CloseAllFilesButton />
                </div>
            </div>
        </header>
    );
}

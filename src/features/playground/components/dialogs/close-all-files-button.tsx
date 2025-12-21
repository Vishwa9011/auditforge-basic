import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUiToggle } from '@features/playground/hooks';
import { saveAllUnsavedFiles } from '@features/playground/lib';
import { useFileEditorStore, useFileSystem } from '@features/playground/store';

function getCloseAllTabsTriggerTitle({
    title,
    hasOpenFiles,
    unsavedCount,
}: {
    title?: string;
    hasOpenFiles: boolean;
    unsavedCount: number;
}) {
    if (title) return title;

    const baseTitle = 'Close all tabs';
    if (!hasOpenFiles) return baseTitle;
    if (unsavedCount > 0) return `${baseTitle} (${unsavedCount} unsaved)`;
    return baseTitle;
}

type CloseAllFilesButtonProps = {
    title?: string;
    isTriggerButton?: boolean;
    action?: () => void;
};

export function CloseAllFilesButton({ title, isTriggerButton = true, action }: CloseAllFilesButtonProps) {
    const closeAllFilesDialog = useUiToggle('close-all-files-dialog', false);
    const analyzerPanel = useUiToggle('analyzer-panel');
    const [isWorking, setIsWorking] = useState(false);

    const openFilesCount = useFileSystem(state => state.openFiles.size);
    const closeAllFiles = useFileSystem(state => state.closeAllFiles);

    const unsavedCount = useFileEditorStore(state => state.unsavedInos.size);
    const clearAllUnsaved = useFileEditorStore(state => state.clearAllUnsaved);

    const hasOpenFiles = openFilesCount > 0;
    const hasUnsavedChanges = unsavedCount > 0;
    const isDisabled = !hasOpenFiles || isWorking;

    const setDialogOpen = (nextOpen: boolean) => {
        closeAllFilesDialog.toggle(nextOpen);
    };

    const triggerTitle = getCloseAllTabsTriggerTitle({ title, hasOpenFiles, unsavedCount });

    const handleRequestCloseAll = () => {
        if (!hasOpenFiles) return;
        if (hasUnsavedChanges) {
            setDialogOpen(true);
            return;
        }
        closeAllFiles();
        action?.();
        if (analyzerPanel.isEnabled) analyzerPanel.toggle(false);
    };

    const handleSaveAllAndClose = async () => {
        setIsWorking(true);
        try {
            await saveAllUnsavedFiles();
            closeAllFiles();
            setDialogOpen(false);
            action?.();
            if (analyzerPanel.isEnabled) analyzerPanel.toggle(false);
        } finally {
            setIsWorking(false);
        }
    };

    const handleDiscardAllAndClose = () => {
        clearAllUnsaved();
        closeAllFiles();
        setDialogOpen(false);
        action?.();
        if (analyzerPanel.isEnabled) analyzerPanel.toggle(false);
    };

    const handleDialogOpenChange = (nextOpen: boolean) => {
        if (isWorking) return;
        setDialogOpen(nextOpen);
    };

    const unsavedLabel = unsavedCount === 1 ? 'file' : 'files';

    return (
        <>
            {isTriggerButton && (
                <Button
                    type="button"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    title={triggerTitle}
                    aria-label={triggerTitle}
                    disabled={isDisabled}
                    onClick={handleRequestCloseAll}
                >
                    <span>Close all</span>
                </Button>
            )}

            <AlertDialog open={closeAllFilesDialog.isEnabled} onOpenChange={handleDialogOpenChange}>
                <AlertDialogContent className="rounded-xl p-6 sm:max-w-sm">
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-muted text-foreground mb-4 flex size-12 items-center justify-center rounded-xl">
                            <TriangleAlert className="size-6" aria-hidden="true" />
                        </div>

                        <AlertDialogHeader className="space-y-1 ">
                            <AlertDialogTitle className="text-center text-base leading-snug">
                                {title ?? 'Close all files?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                                You have unsaved changes in {unsavedCount} {unsavedLabel}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="mt-5 grid w-full gap-2">
                            <AlertDialogAction asChild>
                                <Button className="h-10 w-full" disabled={isWorking} onClick={handleSaveAllAndClose}>
                                    {isWorking ? 'Saving…' : 'Save All & Close'}
                                </Button>
                            </AlertDialogAction>

                            <AlertDialogAction asChild>
                                <Button
                                    variant="secondary"
                                    className="h-10 w-full"
                                    disabled={isWorking}
                                    onClick={handleDiscardAllAndClose}
                                >
                                    Don&apos;t Save
                                </Button>
                            </AlertDialogAction>

                            <AlertDialogCancel asChild>
                                <Button variant="outline" className="h-10 w-full" disabled={isWorking}>
                                    Cancel
                                </Button>
                            </AlertDialogCancel>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

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
import { saveAllUnsavedFiles } from '../../lib';
import { useFileExplorerStore, useFileSystem } from '../../store';
import { TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';

export function CloseAllFilesButton() {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isWorking, setIsWorking] = useState(false);

    const openFilesCount = useFileSystem(state => state.openFiles.size);
    const closeAllFiles = useFileSystem(state => state.closeAllFiles);

    const unsavedInos = useFileExplorerStore(state => state.unsavedInos);
    const clearUnsaved = useFileExplorerStore(state => state.clearUnsaved);

    const unsavedCount = unsavedInos.size;
    const isDisabled = openFilesCount === 0 || isWorking;

    const title = useMemo(() => {
        if (openFilesCount === 0) return 'Close all tabs';
        if (unsavedCount > 0) return `Close all tabs (${unsavedCount} unsaved)`;
        return 'Close all tabs';
    }, [openFilesCount, unsavedCount]);

    const requestCloseAll = () => {
        if (openFilesCount === 0) return;
        if (unsavedCount > 0) setIsAlertOpen(true);
        else closeAllFiles();
    };

    const saveAllAndClose = async () => {
        setIsWorking(true);
        try {
            await saveAllUnsavedFiles();
            closeAllFiles();
            setIsAlertOpen(false);
        } finally {
            setIsWorking(false);
        }
    };

    const discardAllAndClose = () => {
        const inos = Array.from(unsavedInos);
        for (const ino of inos) clearUnsaved(ino);
        closeAllFiles();
        setIsAlertOpen(false);
    };

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                className="h-7 px-2 text-xs"
                title={title}
                aria-label={title}
                disabled={isDisabled}
                onClick={requestCloseAll}
            >
                <span>Close all</span>
            </Button>

            <AlertDialog
                open={isAlertOpen}
                onOpenChange={nextOpen => {
                    if (isWorking) return;
                    setIsAlertOpen(nextOpen);
                }}
            >
                <AlertDialogContent className="rounded-xl p-6 sm:max-w-sm">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-foreground">
                            <TriangleAlert className="size-6" aria-hidden="true" />
                        </div>

                        <AlertDialogHeader className="space-y-1">
                            <AlertDialogTitle className="text-base leading-snug">Close all tabs?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                                You have unsaved changes in {unsavedCount} {unsavedCount === 1 ? 'file' : 'files'}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="mt-5 grid w-full gap-2">
                            <AlertDialogAction asChild>
                                <Button className="h-10 w-full" disabled={isWorking} onClick={saveAllAndClose}>
                                    {isWorking ? 'Saving…' : 'Save All & Close'}
                                </Button>
                            </AlertDialogAction>

                            <AlertDialogAction asChild>
                                <Button
                                    variant="secondary"
                                    className="h-10 w-full"
                                    disabled={isWorking}
                                    onClick={discardAllAndClose}
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

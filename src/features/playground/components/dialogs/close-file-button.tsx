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
import type { InodeMeta } from '../../types';
import { useFileExplorerStore, useFileSystem } from '../../store';
import { useToggle } from '../../hooks';
import { TriangleAlert, X } from 'lucide-react';
import { saveFileByIno } from '../../lib';
import { useMemo, useState, type MouseEvent } from 'react';
import { resolveFilename } from '../../store/file-system';

type CloseFileButtonProps = InodeMeta & { path: string; name?: string; content?: string };

export function CloseFileButton({ ino, path, name }: CloseFileButtonProps) {
    const [isAlertOpen, setIsAlertOpen] = useToggle(false);
    const [isSaving, setIsSaving] = useState(false);
    const closeFile = useFileSystem(state => state.closeFile);
    const hasUnsavedChanges = useFileExplorerStore(state => state.unsavedInos.has(ino));

    const clearUnsaved = useFileExplorerStore(state => state.clearUnsaved);
    const displayName = useMemo(() => name ?? resolveFilename(path) ?? 'this file', [name, path]);

    const requestClose = () => {
        if (hasUnsavedChanges) {
            setIsAlertOpen(true);
        } else {
            closeFile(path);
        }
    };

    const handleSaveChanges = async (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        setIsSaving(true);
        try {
            await saveFileByIno(ino);
            closeFile(path);
            setIsAlertOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscardChanges = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        clearUnsaved(ino);
        closeFile(path);
        setIsAlertOpen(false);
    };

    return (
        <>
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="hover:!bg-accent/80 relative size-6 rounded-sm p-0 opacity-60 transition-opacity group-hover:opacity-100"
                title={hasUnsavedChanges ? 'Close (unsaved changes)' : 'Close'}
                aria-label={hasUnsavedChanges ? 'Close file (unsaved changes)' : 'Close file'}
                onPointerDown={event => event.stopPropagation()}
                onClick={event => {
                    event.stopPropagation();
                    requestClose();
                }}
            >
                <span className="pointer-events-none absolute inset-0">
                    <span
                        className={
                            hasUnsavedChanges
                                ? 'bg-foreground/90 absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity group-hover:opacity-0'
                                : 'bg-foreground/90 absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0'
                        }
                    />
                    <X
                        className={
                            hasUnsavedChanges
                                ? 'text-muted-foreground absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100'
                                : 'text-muted-foreground absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 opacity-70 transition-opacity group-hover:opacity-100'
                        }
                    />
                </span>
            </Button>

            <AlertDialog
                open={isAlertOpen}
                onOpenChange={nextOpen => {
                    if (isSaving) return;
                    setIsAlertOpen(nextOpen);
                }}
            >
                <AlertDialogContent
                    className="rounded-xl p-6 sm:max-w-xs"
                    onPointerDown={event => event.stopPropagation()}
                    onClick={event => event.stopPropagation()}
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-foreground">
                            <TriangleAlert className="size-6" aria-hidden="true" />
                        </div>

                        <AlertDialogHeader className="space-y-1">
                            <AlertDialogTitle className="text-center text-base leading-snug">
                                Save changes you made to <span className="font-semibold">{displayName}</span>?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground text-center text-sm leading-relaxed">
                                Your changes will be lost if you don&apos;t save them.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="mt-5 grid w-full gap-2">
                            <AlertDialogAction asChild>
                                <Button
                                    className="h-10 w-full rounded-full"
                                    disabled={isSaving}
                                    onClick={handleSaveChanges}
                                >
                                    {isSaving ? 'Saving…' : 'Save'}
                                </Button>
                            </AlertDialogAction>

                            <AlertDialogAction asChild>
                                <Button
                                    variant="secondary"
                                    className="h-10 w-full rounded-full"
                                    disabled={isSaving}
                                    onClick={handleDiscardChanges}
                                >
                                    Don&apos;t Save
                                </Button>
                            </AlertDialogAction>

                            <AlertDialogCancel asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 w-full rounded-full"
                                    disabled={isSaving}
                                    onClick={e => e.stopPropagation()}
                                >
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

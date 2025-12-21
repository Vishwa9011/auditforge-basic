import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { confirmCloseAllFilesIfUnsavedChanges, createFileWithContent } from '../../lib';
import { useToggle } from '@features/playground/hooks';
import { WELCOME_FILE_CONTENT } from '../../store/file-system';
import { CloseAllFilesButton } from './close-all-files-button';
import { type FormEvent, type MouseEvent, useState } from 'react';
import { getWorkspaceNames } from '@features/playground/store/file-system';
import { useFileSystem } from '@features/playground/store';

const WORKSPACES_ROOT = '/.workspaces';

type CreateWorkspaceDialogProps = {
    onWorkspaceCreated?: () => void;
};

export function CreateWorkspaceDialog({ onWorkspaceCreated }: CreateWorkspaceDialogProps) {
    const [createDialogOpen, setCreateDialogOpen] = useToggle(false);
    const [workspaceNameInput, setWorkspaceNameInput] = useState('');

    const createDir = useFileSystem(state => state.createDir);
    const openFile = useFileSystem(state => state.openFile);
    const closeAllFiles = useFileSystem(state => state.closeAllFiles);
    const selectWorkspace = useFileSystem(state => state.selectWorkspace);

    const ensureNoUnsavedChanges = () => {
        return !confirmCloseAllFilesIfUnsavedChanges();
    };

    const handleCloseAllFilesComplete = () => {
        setCreateDialogOpen(true);
    };

    const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!ensureNoUnsavedChanges()) return;
        setCreateDialogOpen(true);
    };

    const handleCreateWorkspaceSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const workspaceName = workspaceNameInput.trim();
        if (!workspaceName) return;
        if (!ensureNoUnsavedChanges()) return;

        const existingWorkspaceNames = getWorkspaceNames(useFileSystem.getState().fsTree);
        if (existingWorkspaceNames.includes(workspaceName)) {
            toast.error('Workspace with this name already exists');
            return;
        }

        createDir(WORKSPACES_ROOT, workspaceName);

        const workspaceDirPath = `${WORKSPACES_ROOT}/${workspaceName}`;
        const welcomeFilePath = `${workspaceDirPath}/welcome.md`;
        const didCreateWelcomeFile = await createFileWithContent(welcomeFilePath, WELCOME_FILE_CONTENT);
        if (!didCreateWelcomeFile) {
            toast.error('Failed to create welcome file');
            return;
        }

        closeAllFiles();
        openFile(welcomeFilePath);
        selectWorkspace(workspaceName);

        setWorkspaceNameInput('');
        setCreateDialogOpen(false);
        onWorkspaceCreated?.();
        toast.success('Workspace created successfully');
    };

    return (
        <>
            <CloseAllFilesButton
                title="Close all files?"
                isTriggerButton={false}
                action={handleCloseAllFilesComplete}
            />

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 font-normal"
                        onClick={handleTriggerClick}
                    >
                        <Plus className="size-4" />
                        New workspace…
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Workspace</DialogTitle>
                        <DialogDescription>
                            Workspaces are a way to organize your files and projects separately. Create a new workspace
                            to get started.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateWorkspaceSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="workspace-name" className="text-sm font-medium">
                                Workspace name
                            </label>
                            <Input
                                id="workspace-name"
                                placeholder="my-workspace"
                                value={workspaceNameInput}
                                onChange={e => setWorkspaceNameInput(e.target.value)}
                            />
                        </div>

                        <DialogFooter className="sm:flex-row sm:justify-end">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

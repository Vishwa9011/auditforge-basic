import { FileTree } from './file-tree';
import { useFileSystem } from '@features/playground/store';
import { Button } from '@/components/ui/button';
import { useWorkspaceRootCreate } from '@features/playground/hooks';
import { resolvePath } from '@features/playground/store/file-system';
import { FilePlusCorner, FolderPlus } from 'lucide-react';
import { NodeNameInput } from './file-tree/NodeNameInput';
import { WorkspacePopover } from '@features/playground/components/dialogs';
import { useInitializeDefaultWorkspace } from '../hooks/useInitializeDefaultWorkspace';

export function FileExplorer() {
    const {
        canCreateInWorkspace,
        createMode,
        createDraftKey,
        placeholder,
        handleCreateFileClick,
        handleCreateFolderClick,
        handleNameInputBlur,
        handleNameSubmit,
    } = useWorkspaceRootCreate();

    const isWorkSpaceLoading = useInitializeDefaultWorkspace().isLoading;

    if (isWorkSpaceLoading) {
        return <WorkspaceLoading />;
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-border/60 bg-background sticky top-0 z-10 flex h-10 items-center justify-between border-b px-3 py-2">
                <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">File Explorer</h2>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="New file"
                        disabled={!canCreateInWorkspace}
                        onClick={handleCreateFileClick}
                    >
                        <FilePlusCorner />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label="New folder"
                        disabled={!canCreateInWorkspace}
                        onClick={handleCreateFolderClick}
                    >
                        <FolderPlus />
                    </Button>
                </div>
            </div>

            <div className="border-border/60 space-y-2 border-b px-3 py-3">
                <div className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">Workspace</div>
                <WorkspacePopover />
            </div>

            <div className="scroll-thin min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-1 py-1">
                <NodeNameInput
                    key={createDraftKey}
                    isOpen={createMode !== 'none'}
                    onBlur={handleNameInputBlur}
                    onSubmit={handleNameSubmit}
                    placeholder={placeholder}
                />
                <FileTreeRoot />
            </div>
        </div>
    );
}

function FileTreeRoot() {
    const cwd = useFileSystem(state => state.cwd);
    const selectedWorkspace = useFileSystem(state => state.selectedWorkspace);
    const fsTree = useFileSystem(state => state.fsTree);

    const parent = resolvePath(cwd, fsTree);
    if (parent.kind === 'missing') {
        return (
            <div className="text-muted-foreground px-2 py-3 text-sm">
                No workspace selected. Create one from the Workspace picker above.
            </div>
        );
    }

    return <FileTree path={cwd} name={selectedWorkspace || '/'} node={parent.node} />;
}

function WorkspaceLoading() {
    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            <div className="border-border/60 bg-background flex h-10 items-center border-b px-3 py-2">
                <h2 className="text-muted-foreground align-middle text-xs font-semibold tracking-wide uppercase">
                    File Explorer
                </h2>
            </div>
            <div className="border-accent mx-auto h-10 w-10 animate-spin rounded-full border-4 border-dashed"></div>
        </div>
    );
}

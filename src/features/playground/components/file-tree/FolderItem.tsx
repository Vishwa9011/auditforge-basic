import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useToggle } from '../../hooks';
import { Button } from '@/components/ui/button';
import { buildPath, renderedPathsIndex } from '../../store/file-system';
import { useFileSystem } from '../../store';
import type { FsNode, InodeMeta } from '../../types';
import { memo, useState, type MouseEvent, type ReactNode } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, FilePlusCorner, Folder, FolderOpen, FolderPlus, Pencil } from 'lucide-react';
import { NodeNameInput } from './NodeNameInput';
import { TreeItemActionBar } from './TreeItemActionBar';
import type { FolderOperationMode } from './types';
import { DeleteDialog } from '../dialogs/delete-dialog';

type FolderItemProps = {
    name: string;
    node: FsNode | InodeMeta;
    depth?: number;
    path: string;
    children: ReactNode;
};

export const FolderItem = memo(function FolderItem({ name, path, children }: FolderItemProps) {
    const [isOpen, setIsOpen] = useToggle();
    const createFile = useFileSystem(state => state.createFile);
    const createFolder = useFileSystem(state => state.createDir);
    const renameNode = useFileSystem(state => state.renameNode);
    const deleteNode = useFileSystem(state => state.deleteNode);

    const [operationMode, setOperationMode] = useState<FolderOperationMode>('none');
    const [isNameInputOpen, setIsNameInputOpen] = useState(false);

    const handleCreateFileClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsOpen(true);
        setIsNameInputOpen(true);
        setOperationMode('create-file');
    };

    const handleCreateFolderClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsOpen(true);
        setIsNameInputOpen(true);
        setOperationMode('create-folder');
    };

    const handleRenameClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsNameInputOpen(true);
        setOperationMode('rename');
    };

    const handleNameSubmit = (name: string) => {
        if (operationMode === 'create-file') {
            if (renderedPathsIndex.has(buildPath(path, name))) {
                toast.error('A file or folder with this name already exists');
                throw new Error('A file or folder with this name already exists');
            }
            createFile(path, name);
            toast.success('File created successfully');
        } else if (operationMode === 'create-folder') {
            if (renderedPathsIndex.has(buildPath(path, name))) {
                toast.error('A file or folder with this name already exists');
                throw new Error('A file or folder with this name already exists');
            }
            createFolder(path, name);
            toast.success('Folder created successfully');
        } else if (operationMode === 'rename') {
            renameNode(path, name);
            toast.success('Renamed successfully');
        } else if (operationMode === 'delete') {
            deleteNode(path);
            toast.success('Deleted successfully');
        }
        setIsNameInputOpen(false);
        setOperationMode('none');
    };

    const handleNameInputBlur = () => {
        setIsNameInputOpen(false);
    };

    const FolderIcon = isOpen ? FolderOpen : Folder;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <div
                    className={cn(
                        'group flex h-7 w-full items-center justify-between gap-2 rounded-md px-2 text-sm',
                        'hover:bg-accent/50',
                    )}
                >
                    {isNameInputOpen && operationMode == 'rename' ? (
                        <NodeNameInput
                            isOpen={isNameInputOpen}
                            onBlur={handleNameInputBlur}
                            onSubmit={handleNameSubmit}
                            defaultValue={name}
                        />
                    ) : (
                        <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5">
                            <ChevronRight
                                className={cn(
                                    'text-muted-foreground size-4 transition-transform',
                                    isOpen && 'rotate-90',
                                )}
                            />
                            <FolderIcon
                                className="size-4 transition-all"
                                fill="#E3B341"
                                fillOpacity={0.75}
                                stroke={isOpen ? '#8F6B1F' : '#B8964E'}
                                strokeWidth={isOpen ? 1.75 : 1.5}
                            />
                            <p className="truncate">{name}</p>
                        </div>
                    )}

                    <TreeItemActionBar isHidden={isNameInputOpen}>
                        <Button variant="ghost" size="icon-xs" onClick={handleCreateFileClick}>
                            <FilePlusCorner />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={handleCreateFolderClick}>
                            <FolderPlus />
                        </Button>
                        <Button variant="ghost" size="icon-xs" onClick={handleRenameClick}>
                            <Pencil />
                        </Button>
                        <DeleteDialog action={() => setOperationMode('delete')} name={name} type={'dir'} />
                    </TreeItemActionBar>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-5">
                <NodeNameInput
                    isOpen={isNameInputOpen && operationMode != 'rename'}
                    onBlur={handleNameInputBlur}
                    onSubmit={handleNameSubmit}
                />
                <div className="border-border/50 mt-0.5 border-l pl-2">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    );
});

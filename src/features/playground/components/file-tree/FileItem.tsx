import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileBraces, Pencil } from 'lucide-react';
import { memo, useState, type MouseEvent } from 'react';
import type { InodeMeta } from '../../types';
import { useFileSystem } from '../../store';
import { NodeNameInput } from './NodeNameInput';
import { TreeItemActionBar } from './TreeItemActionBar';
import type { FileOperationMode } from './types';
import { DeleteDialog } from '../dialogs/delete-dialog';

type FileItemProps = {
    name: string;
    node: InodeMeta;
    depth?: number;
    path: string;
};

export const FileItem = memo(function FileItem({ path, name, node }: FileItemProps) {
    const renameNode = useFileSystem(state => state.renameNode);
    const deleteNode = useFileSystem(state => state.deleteNode);
    const openFile = useFileSystem(state => state.openFile);
    const setActiveFilePath = useFileSystem(state => state.setActiveFilePath);

    const [operationMode, setOperationMode] = useState<FileOperationMode>('none');
    const [isNameInputOpen, setIsNameInputOpen] = useState(false);

    const handleNameSubmit = (nextName: string) => {
        if (operationMode === 'rename') {
            renameNode(path, nextName);
            toast.success('Renamed successfully');
        }
        setIsNameInputOpen(false);
        setOperationMode('none');
    };

    const handleRenameClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsNameInputOpen(true);
        setOperationMode('rename');
    };

    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        deleteNode(path);
        toast.success('Deleted successfully');
    };

    const handleNameInputBlur = () => {
        setIsNameInputOpen(false);
    };

    const onFileClick = () => {
        console.log('Adding file to open files: ', node);
        openFile(path);
        setActiveFilePath(path);
    };

    return (
        <div
            className={cn(
                'group flex h-7 cursor-pointer items-center justify-between gap-2 rounded-md px-2 text-sm',
                'hover:bg-accent/50',
            )}
            onClick={onFileClick}
        >
            {isNameInputOpen ? (
                <NodeNameInput
                    isOpen={isNameInputOpen}
                    onBlur={handleNameInputBlur}
                    onSubmit={handleNameSubmit}
                    defaultValue={name}
                />
            ) : (
                <div className="flex min-w-0 items-center gap-1.5">
                    <FileBraces className="text-muted-foreground size-4" />
                    <span className="truncate">{name}</span>
                </div>
            )}

            <TreeItemActionBar isHidden={isNameInputOpen}>
                <Button variant="ghost" size="icon-xs" onClick={handleRenameClick}>
                    <Pencil />
                </Button>
                <DeleteDialog action={handleDelete} name={name} type={node.type} />
            </TreeItemActionBar>
        </div>
    );
});

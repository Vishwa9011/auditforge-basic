import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NodeNameInput } from './NodeNameInput';
import type { FileOperationMode } from './types';
import { memo, useState, type MouseEvent } from 'react';
import { TreeItemActionBar } from './TreeItemActionBar';
import { useFileSystem } from '@features/playground/store';
import type { InodeMeta } from '@features/playground/types';
import { FileIcon } from '@features/playground/components';
import { DeleteDialog } from '@features/playground/components/dialogs';
import { getFileExtension } from '@features/playground/store/file-system';

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

    const handleDelete = () => {
        deleteNode(path);
        toast.success('Deleted successfully');
    };

    const handleNameInputBlur = () => {
        setIsNameInputOpen(false);
    };

    const onFileClick = () => {
        openFile(path);
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
                    <FileIcon mode="img" className="size-4" extension={getFileExtension(path)} />
                    <span className="truncate">{name}</span>
                </div>
            )}

            <TreeItemActionBar isHidden={isNameInputOpen}>
                <Button variant="ghost" size="icon-xs" onClick={handleRenameClick}>
                    <Pencil />
                </Button>
                <DeleteDialog action={handleDelete} onClick={e => e.stopPropagation()} name={name} type={node.type} />
            </TreeItemActionBar>
        </div>
    );
});

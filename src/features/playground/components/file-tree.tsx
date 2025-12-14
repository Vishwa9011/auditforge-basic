import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useToggle } from '../hooks';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from './delete-dialog';
import { Button } from '@/components/ui/button';
import { buildPath, getDirEntries, pathIndexed, useFileSystem } from '../store';
import type { FsNode, InodeMeta } from '../types';
import { memo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, FileBraces, FilePlusCorner, Folder, FolderOpen, FolderPlus, Pencil } from 'lucide-react';
import { getMeta } from '../lib';

type FileTreeProps = {
    name: string;
    path: string;
    node: FsNode | InodeMeta;
    depth?: number;
};

export const FileTree = memo(function FileTree({ path, name, node }: FileTreeProps) {
    pathIndexed.set(path, true);
    const meta = getMeta(node);
    if (meta.type == 'file') {
        return <FileItem path={path} name={name} node={meta} />;
    }

    return (
        <div className="space-y-0.5">
            {getDirEntries(node as FsNode).map(([childName, childNode]) => (
                <FileTreeNode path={buildPath(path, childName)} key={childName} name={childName} node={childNode} />
            ))}
        </div>
    );
});

type FileTreeNodeProps = {
    name: string;
    node: FsNode | InodeMeta;
    depth?: number;
    path: string;
};

const FileTreeNode = ({ name, node, path }: FileTreeNodeProps) => {
    const meta = getMeta(node);
    pathIndexed.set(path, true);

    switch (meta.type) {
        case 'file':
            return <FileItem path={path} name={name} node={meta} />;
        case 'dir':
            return <FolderItem path={path} name={name} node={node} />;
        default:
            return null;
    }
};

type FileItemProps = {
    name: string;
    node: InodeMeta;
    depth?: number;
    path: string;
};

const FileItem = memo(function FileItem({ path, name, node }: FileItemProps) {
    const renameNode = useFileSystem(state => state.renameNode);
    const deleteNode = useFileSystem(state => state.deleteNode);
    const addOpenFiles = useFileSystem(state => state.addOpenFiles);
    const setActiveFile = useFileSystem(state => state.setActiveFile);

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

    const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        deleteNode(path);
        toast.success('Deleted successfully');
    };

    const handleNameInputBlur = () => {
        setIsNameInputOpen(false);
    };

    const onFileClick = () => {
        console.log('Adding file to open files: ', node);
        addOpenFiles(path);
        setActiveFile(path);
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

type FolderItemProps = {
    name: string;
    node: FsNode | InodeMeta;
    depth?: number;
    path: string;
};

const FolderItem = memo(function FolderItem({ name, node, path }: FolderItemProps) {
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
            if (pathIndexed.has(buildPath(path, name))) {
                toast.error('A file or folder with this name already exists');
                throw new Error('A file or folder with this name already exists');
            }
            createFile(path, name);
            toast.success('File created successfully');
        } else if (operationMode === 'create-folder') {
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
                            <FolderIcon className="text-muted-foreground size-4" />
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
                <div className="border-border/50 mt-0.5 border-l pl-2">
                    <FileTree path={path} name={name} node={node} />
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
});

type FileOperationMode = 'none' | 'rename';
type FolderOperationMode = 'none' | 'create-file' | 'create-folder' | 'delete' | 'rename';

type TreeItemActionBarProps = {
    children: ReactNode;
    isHidden: boolean;
};

function TreeItemActionBar({ children, isHidden }: TreeItemActionBarProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-1 opacity-0 transition-opacity',
                'pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100',
                isHidden && '!hidden',
            )}
        >
            {children}
        </div>
    );
}

type NodeNameInputProps = {
    isOpen: boolean;
    onBlur: () => void;
    defaultValue?: string;
    onSubmit: (name: string) => void;
};

const NodeNameInput = ({ isOpen, onBlur, onSubmit, defaultValue }: NodeNameInputProps) => {
    const [inputValue, setInputValue] = useState(defaultValue || '');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(inputValue);
        setInputValue('');
    };

    if (!isOpen) return null;
    return (
        <div className="flex min-w-0 flex-1">
            <form className="w-full" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    maxLength={25}
                    onBlur={onBlur}
                    autoFocus
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="bg-background h-7 px-2 text-sm"
                />
            </form>
        </div>
    );
};

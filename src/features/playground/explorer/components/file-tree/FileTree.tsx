import { memo } from 'react';
import type { FsNode, InodeMeta } from '@features/playground/types';
import { buildPath, getDirEntries, getMeta, renderedPathsIndex } from '@features/playground/store/file-system';
import { FileItem } from './FileItem';
import { FolderItem } from './FolderItem';

type FileTreeProps = {
    name: string;
    path: string;
    node: FsNode | InodeMeta;
    depth?: number;
};

export const FileTree = memo(function FileTree({ path, name, node }: FileTreeProps) {
    renderedPathsIndex.set(path, true);

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

function FileTreeNode({ name, node, path }: FileTreeNodeProps) {
    const meta = getMeta(node);
    renderedPathsIndex.set(path, true);

    switch (meta.type) {
        case 'file':
            return <FileItem path={path} name={name} node={meta} />;
        case 'dir':
            return (
                <FolderItem path={path} name={name} node={node}>
                    <FileTree path={path} name={name} node={node} />
                </FolderItem>
            );
        default:
            return null;
    }
}

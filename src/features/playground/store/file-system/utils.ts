import { META_KEY } from './constants';
import { getMeta, isDir } from './fs-node';
import { useFileSystem } from '../file-system.store';
import { coerceInodeMeta, wrapMeta } from './inode-meta';
import type { FsNode, Ino, ResolveResult } from '../../types';

export function resolvePath(path: string, fsTreeParam?: Map<string, FsNode>): ResolveResult {
    const fsTree = fsTreeParam ?? useFileSystem.getState().fsTree;
    return resolvePathInTree(path, fsTree);
}

export function resolvePathInTree(path: string, fsTree: Map<string, FsNode>): ResolveResult {
    const parts = path.split('/').filter(Boolean);

    // root
    let node = fsTree.get('/');
    if (!node) {
        return { kind: 'missing', at: '/' };
    }

    // special case: "/"
    if (parts.length === 0) {
        return { kind: 'found', node, meta: getMeta(node) };
    }

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (!isDir(node)) {
            return { kind: 'missing', at: parts.slice(0, i).join('/') };
        }

        const next = node.get(part);
        if (!next) {
            return { kind: 'missing', at: parts.slice(0, i + 1).join('/') };
        }

        if (next instanceof Map) {
            node = next as FsNode;
            continue;
        }

        const meta = coerceInodeMeta(next);
        if (meta) {
            if (i < parts.length - 1) {
                return { kind: 'missing', at: parts.slice(0, i + 1).join('/') };
            }
            return { kind: 'found', node: wrapMeta(meta), meta };
        }

        return { kind: 'missing', at: parts.slice(0, i + 1).join('/') };
    }

    return { kind: 'found', node, meta: getMeta(node) };
}

export function resolveFilename(path: string) {
    const parts = path.split('/').filter(Boolean);
    return parts.length === 0 ? null : parts[parts.length - 1];
}

export function getDirEntries(node: FsNode) {
    if (!(node instanceof Map)) return [];

    const outDirs: Array<[string, FsNode]> = [];
    const outFiles: Array<[string, FsNode]> = [];

    for (const [key, value] of node.entries()) {
        if (key === META_KEY) continue;
        if (typeof key !== 'string') continue;

        if (value instanceof Map) {
            const meta = getMeta(value);
            if (meta.type === 'dir') {
                outDirs.push([key, value]);
            } else {
                outFiles.push([key, value]);
            }
            continue;
        }
    }
    return [...outDirs.sort(), ...outFiles.sort()];
}

export function buildPath(parentPath: string, name: string) {
    if (parentPath === '/') return `/${name}`;
    return `${parentPath}/${name}`;
}

export function splitPath(path: string): { parentPath: string; name: string } | null {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name) return null;
    const parentPath = parts.length === 0 ? '/' : `/${parts.join('/')}`;
    return { parentPath, name };
}

export function computeNextIno(fsTree: Map<string, FsNode>): Ino {
    let max = 0;

    const walk = (node: FsNode) => {
        const meta = getMeta(node);
        max = Math.max(max, meta.ino);
        for (const [key, value] of node.entries()) {
            if (key === META_KEY) continue;
            if (value instanceof Map) {
                walk(value as FsNode);
                continue;
            }
            const m = coerceInodeMeta(value);
            if (m) max = Math.max(max, m.ino);
        }
    };

    for (const [, root] of fsTree.entries()) walk(root);

    return (max + 1) as Ino;
}

export const pathIndexed = new Map<string, boolean>();
export const renderedPathsIndex = pathIndexed;

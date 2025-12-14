import type { FsNode, Ino, InodeMeta } from '../../types';
import { META_KEY } from './constants';
import { coerceInodeMeta } from './inode-meta';

export function makeFileNode(ino: Ino) {
    return {
        ino,
        mode: 511,
        type: 'file',
        mtimeMs: Date.now(),
        size: 0,
    } as InodeMeta;
}

export function makeDirNode(ino: Ino) {
    return {
        ino,
        mode: 511,
        type: 'dir',
        mtimeMs: Date.now(),
        size: 0,
    } as InodeMeta;
}

/** Utility: strongly typed meta getter (supports legacy shapes) */
export function getMeta(node: FsNode | InodeMeta): InodeMeta {
    if (!(node instanceof Map)) {
        const coerced = coerceInodeMeta(node);
        if (coerced) return coerced;
        throw new Error('Invalid FsNode: expected Map with META_KEY metadata');
    }

    const metaValue = node.get(META_KEY);
    const meta = coerceInodeMeta(metaValue);
    if (!meta) {
        throw new Error('Invalid FsNode: missing META_KEY metadata');
    }

    return meta;
}

/** Type guard helpers */
export function isDir(node: FsNode | InodeMeta): boolean {
    return getMeta(node).type === 'dir';
}

export function isFile(node: FsNode | InodeMeta): boolean {
    return getMeta(node).type === 'file';
}


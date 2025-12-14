import type { FsNode, Ino, InodeMeta } from '../../types';
import { META_KEY } from './constants';

export function isInodeMetaLike(value: unknown): value is InodeMeta {
    if (!value || typeof value !== 'object') return false;
    const v = value as { ino?: unknown; type?: unknown };
    return typeof v.ino === 'number' && (v.type === 'file' || v.type === 'dir');
}

export function coerceInodeMeta(value: unknown): InodeMeta | null {
    if (!isInodeMetaLike(value)) return null;
    const v = value as {
        ino?: unknown;
        type?: unknown;
        mode?: unknown;
        mtimeMs?: unknown;
        size?: unknown;
    };
    return {
        ino: v.ino as Ino,
        type: v.type as InodeMeta['type'],
        mode: typeof v.mode === 'number' ? v.mode : 511,
        mtimeMs: typeof v.mtimeMs === 'number' ? v.mtimeMs : Date.now(),
        size: typeof v.size === 'number' ? v.size : 0,
    };
}

export function wrapMeta(meta: InodeMeta): FsNode {
    return new Map<string | typeof META_KEY, FsNode | InodeMeta>().set(META_KEY, meta) as FsNode;
}

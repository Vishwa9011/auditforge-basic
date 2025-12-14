import type { FsNode } from '../../types';
import { META_KEY } from './constants';
import { coerceInodeMeta, wrapMeta } from './inode-meta';

type SerializedEntry = [string | number, unknown];
type SerializedNode = SerializedEntry[];

function serializeNode(node: FsNode): SerializedNode {
    return Array.from(node.entries()).map(([key, value]) => [
        key as string | number,
        value instanceof Map ? serializeNode(value) : value,
    ]);
}

export function serializeFsTree(tree: Map<string, FsNode>) {
    return Array.from(tree.entries()).map(([key, value]) => [key, serializeNode(value)]);
}

function deserializeNode(data: unknown): FsNode {
    const entries = data as SerializedNode;
    return new Map(
        entries.map(([key, value]) => {
            if (Array.isArray(value)) return [key, deserializeNode(value)];
            if (key !== META_KEY) {
                const meta = coerceInodeMeta(value);
                if (meta) return [key, wrapMeta(meta)];
            }
            return [key, value];
        }),
    ) as FsNode;
}

export function deserializeFsTree(data: unknown): Map<string, FsNode> {
    const entries = data as Array<[string, unknown]>;
    return new Map(entries.map(([key, value]) => [key, deserializeNode(value)]));
}

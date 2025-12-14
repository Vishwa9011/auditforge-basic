import type { Brand } from '@/types';
import type { META_KEY } from '../store/file-system.store';

// Create a unique symbol that represents the "Ino" brand
// unique symbol guarantees no other brand can match it
declare const InoBrand: unique symbol;

// Ino is a number, but NOT just any number
// It must carry the InoBrand label
export type Ino = Brand<number, typeof InoBrand>;

export type InodeMeta = {
    ino: Ino;
    type: 'file' | 'dir';
    mode: number;
    mtimeMs: number;
    size: number;
};

export type FsNode = Map<string | typeof META_KEY, FsNode | InodeMeta>;

export type FileBytes = Uint8Array;

export type DbScehma = {
    dbName: 'AuditForgeFileSystem';
    fileStore: 'AuditForgeSystem_files';
};

export type ResolveResult = { kind: 'found'; node: FsNode; meta: InodeMeta } | { kind: 'missing'; at: string };

import type { Brand } from '@/types';
import type { META_KEY } from '../store/file-system';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export declare const InoBrand: unique symbol;
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

export type FileNode = {
    id: string;
    content: string;
};

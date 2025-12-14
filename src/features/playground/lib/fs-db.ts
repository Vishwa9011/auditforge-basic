import { openDB, type IDBPDatabase } from 'idb';
import type { FsNode, Ino, InodeMeta } from '../types';
import { META_KEY } from '../store/file-system.store';

export const DB_NAME = 'AuditForgeFileSystem';
export const FILE_STORE = 'AuditForgeSystem_files';
export const DB_VERSION = 1;

let ino = 0;

export function allocateIno(): Ino {
    ino += 1;
    return ino as Ino;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(FILE_STORE)) {
                    db.createObjectStore(FILE_STORE);
                }
            },
        });
    }

    return dbPromise;
}

export async function readFileBytes(ino: Ino) {
    const db = await getDb();
    const value = await db.get(FILE_STORE, ino);

    if (!value) return null;
    if (value instanceof Uint8Array) return value;
    if (value?.buffer instanceof Uint8Array) return value.buffer;
    if (value?.data instanceof Uint8Array) return value.data;

    return null;
}

export async function writeFileBytes(ino: Ino, bytes: Uint8Array) {
    const db = await getDb();
    await db.put(FILE_STORE, bytes, ino);
}

export async function deleteFileBytes(ino: Ino) {
    const db = await getDb();
    await db.delete(FILE_STORE, ino);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');

export async function readFileContent(ino: Ino) {
    const bytes = await readFileBytes(ino);
    return bytes ? decoder.decode(bytes) : '';
}

export async function writeFileContent(ino: Ino, content: string) {
    const bytes = encoder.encode(content);
    await writeFileBytes(ino, bytes);
}

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

/** Utility: strongly typed meta getter */
function isInodeMetaLike(value: unknown): value is InodeMeta {
    if (!value || typeof value !== 'object') return false;
    const v = value as any;
    return typeof v.ino === 'number' && (v.type === 'file' || v.type === 'dir');
}

function coerceInodeMeta(value: unknown): InodeMeta | null {
    if (!isInodeMetaLike(value)) return null;
    const v = value as any;
    return {
        ino: v.ino as Ino,
        type: v.type,
        mode: typeof v.mode === 'number' ? v.mode : 511,
        mtimeMs: typeof v.mtimeMs === 'number' ? v.mtimeMs : Date.now(),
        size: typeof v.size === 'number' ? v.size : 0,
    };
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

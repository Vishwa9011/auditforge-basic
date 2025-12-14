import { openDB, type IDBPDatabase } from 'idb';
import type { Ino } from '../types';

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

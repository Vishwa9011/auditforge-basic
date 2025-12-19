import type { Ino } from '@features/playground/types';
import { writeFileContent } from '@features/playground/lib/fs-db';
import { useFileEditorStore, useFileSystem } from '@features/playground/store';
import { resolvePath, splitPath } from '@features/playground/store/file-system';

export async function saveFileByIno(ino: Ino) {
    const { draftsByIno, clearUnsaved } = useFileEditorStore.getState();
    const draft = draftsByIno.get(ino);
    if (!draft) return false;

    await writeFileContent(ino, draft.content);
    clearUnsaved(ino);
    return true;
}

export async function saveActiveFile() {
    const activeFile = useFileSystem.getState().activeFile;
    if (!activeFile) return;

    const res = resolvePath(activeFile, useFileSystem.getState().fsTree);
    if (res.kind == 'missing') return;

    await saveFileByIno(res.meta.ino);
}

export async function saveAllUnsavedFiles() {
    const { unsavedInos } = useFileEditorStore.getState();
    const inos = Array.from(unsavedInos);

    let savedCount = 0;
    for (const ino of inos) {
        const didSave = await saveFileByIno(ino);
        if (didSave) savedCount += 1;
    }

    return savedCount;
}

export const createFileWithContent = async (path: string, content: string) => {
    const split = splitPath(path);
    const createFile = useFileSystem.getState().createFile;

    if (!split?.name) {
        console.error("filename doesn't exist", path);
        return false;
    }

    createFile(split.parentPath, split.name);

    const res = resolvePath(path, useFileSystem.getState().fsTree);
    console.log('res: ', res);
    if (res.kind !== 'found') {
        console.error('Failed to create file at', `${path}/${split.name}`);
        return false;
    }

    await writeFileContent(res.meta.ino, content);

    return true;
};

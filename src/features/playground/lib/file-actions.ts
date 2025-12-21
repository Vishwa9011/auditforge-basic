import type { Ino } from '@features/playground/types';
import { writeFileContent } from '@features/playground/lib/fs-db';
import { useFileEditorStore, useFileSystem, usePgUiToggle } from '@features/playground/store';
import { resolvePath, splitPath } from '@features/playground/store/file-system';

export async function saveFileByIno(ino: Ino) {
    const { draftsByIno, clearUnsaved } = useFileEditorStore.getState();
    const draft = draftsByIno.get(ino);
    if (!draft) return false;

    await updateFileContentAndSize(draft.path, ino, draft.content);
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

export function confirmCloseAllFilesIfUnsavedChanges() {
    const unsavedCount = useFileEditorStore.getState().unsavedInos.size;
    if (unsavedCount === 0) return false;
    usePgUiToggle.getState().toggle('close-all-files-dialog', true);
    return true;
}

export function confirmCloseFileIfUnsavedChanges(ino: Ino) {
    const hasUnsavedChanges = useFileEditorStore.getState().unsavedInos.has(ino);
    if (!hasUnsavedChanges) return false;
    usePgUiToggle.getState().toggle(`close-file-dialog-${ino}`, true);
    return true;
}

export function closeAllFilesOrConfirmUnsavedChanges() {
    if (confirmCloseAllFilesIfUnsavedChanges()) return true;
    useFileSystem.getState().closeAllFiles();
    return false;
}

export function closeFileOrConfirmUnsavedChanges(path: string, ino: Ino) {
    if (confirmCloseFileIfUnsavedChanges(ino)) return true;
    useFileSystem.getState().closeFile(path);
    return false;
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
    if (res.kind !== 'found') {
        console.error('Failed to create file at', `${path}/${split.name}`);
        return false;
    }

    await updateFileContentAndSize(path, res.meta.ino, content);

    return true;
};

/**
 * @param path Path of the file to update (required)
 * @param ino Inode number of the file to update (required)
 * @param newContent New content to write to the file (required)
 */
export const updateFileContentAndSize = async (path: string, ino: Ino, newContent: string) => {
    const size = await writeFileContent(ino, newContent);
    useFileSystem.getState().updateFileStats(path, size);
};

import type { FsNode, Ino } from '@features/playground/types';
import { writeFileContent } from '@features/playground/lib/fs-db';
import { useFileEditorStore, useFileSystem } from '@features/playground/store';
import { makeDirNode, META_KEY, resolvePath } from '@features/playground/store/file-system';
import { WELCOME_FILE_CONTENT } from '../store/file-system/welcome-file-content';

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

export const createFileWithContent = async (path: string, filename: string, content: string) => {
    const createFile = useFileSystem.getState().createFile;

    createFile(path, filename);

    const res = resolvePath(`${path}/${filename}`, useFileSystem.getState().fsTree);
    if (res.kind !== 'found') {
        console.error('Failed to create file at', `${path}/${filename}`);
        return false;
    }

    await writeFileContent(res.meta.ino, content);

    return true;
};

export function createDefaultWorkspaceSetup() {
    createFileWithContent('/.workspaces/default_workspace', 'Welcome.txt', WELCOME_FILE_CONTENT);
    return new Map<string, FsNode>([
        [
            '/',
            new Map()
                .set(META_KEY, makeDirNode(0 as Ino))
                .set(
                    '.workspaces',
                    new Map()
                        .set(META_KEY, makeDirNode(1 as Ino))
                        .set(
                            'default_workspace',
                            new Map()
                                .set(META_KEY, makeDirNode(2 as Ino))
                                .set('Welcome.txt', new Map().set(META_KEY, makeDirNode(3 as Ino))),
                        ),
                ),
        ],
    ]);
}

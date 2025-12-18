import { useMemo, useState } from 'react';
import type { ContractSourceFile } from '../utils/source-parser';
import { getEditorLanguage } from '@features/playground/editor/editor-config';

const getFileExtension = (path: string) => {
    const parts = path.split('.');
    if (parts.length <= 1) return '';
    return parts[parts.length - 1] || '';
};

export function useImportPreview(importFiles: ContractSourceFile[]) {
    const [activePathDraft, setActivePathDraft] = useState<string>('');

    const activePath = useMemo(() => {
        if (activePathDraft && importFiles.some(f => f.path === activePathDraft)) return activePathDraft;
        return importFiles[0]?.path ?? '';
    }, [activePathDraft, importFiles]);

    const activeFile = useMemo(() => importFiles.find(f => f.path === activePath) ?? null, [activePath, importFiles]);

    const activeFileLanguage = useMemo(() => {
        if (!activeFile) return 'plaintext';
        return getEditorLanguage(getFileExtension(activeFile.path));
    }, [activeFile]);

    return {
        activePath,
        setActivePath: setActivePathDraft,
        activeFile,
        activeFileLanguage,
    };
}


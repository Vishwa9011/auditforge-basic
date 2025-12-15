import Editor from '@monaco-editor/react';
import type { InodeMeta } from '../types';
import { useEffect, useMemo } from 'react';
import { useFileExplorerStore } from '../store';
import { useDebouncedCallback } from 'use-debounce';
import { getFileExtension } from '../store/file-system';

type CodeEditorProps = {
    content?: string | null;
    meta?: InodeMeta | null;
    isEditorOpen: boolean;
    path: string;
};

export function CodeEditor({ path, content, meta, isEditorOpen }: CodeEditorProps) {
    const unsavedInos = useFileExplorerStore(state => state.unsavedInos);
    const markUnsaved = useFileExplorerStore(state => state.markUnsaved);
    const draftsByIno = useFileExplorerStore(state => state.draftsByIno);
    const upsertDraftContent = useFileExplorerStore(state => state.upsertDraftContent);
    const debouncedUpsertDraftContent = useDebouncedCallback(upsertDraftContent, 100);

    function handleEditorValidation(markers: readonly { message: string }[]) {
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }

    function handleEditorChange(value?: string) {
        if (meta && value !== undefined) {
            debouncedUpsertDraftContent(meta.ino, value, path || undefined);
            if (unsavedInos.has(meta.ino)) {
                if (value === content) {
                    useFileExplorerStore.getState().clearUnsaved(meta.ino);
                }
            }
            if (!unsavedInos.has(meta.ino)) markUnsaved(meta.ino);
        }
    }

    const draftContent = useMemo(() => {
        if (!meta) return null;
        if (!draftsByIno.has(meta.ino)) return null;
        return draftsByIno.get(meta.ino)?.content;
    }, [draftsByIno, meta]);

    useEffect(() => {
        const upsertDraftContent = useFileExplorerStore.getState().upsertDraftContent;
        if (meta && content !== undefined && content !== null) {
            if (draftContent == null) {
                upsertDraftContent(meta.ino, content, path || undefined);
            }
        }
    }, [content, meta, draftContent, path]);

    return (
        <div className="border-border h-full w-full border-2 ">
            {!isEditorOpen ? (
                <div className="bg-muted flex h-full w-full flex-col items-center justify-center text-center">
                    <h2 className="text-foreground mb-2 text-2xl font-bold">No file is open</h2>
                    <p className="text-md text-muted-foreground max-w-sm">
                        Open a file from the file explorer to start editing code.
                    </p>
                </div>
            ) : (
                <Editor
                    height="100%"
                    theme="vs-dark"
                    defaultLanguage={getLanguageFromExtension(getFileExtension(path))}
                    defaultValue={draftContent ?? ''}
                    value={draftContent ?? ''}
                    onValidate={handleEditorValidation}
                    onChange={handleEditorChange}
                    options={{
                        fontFamily: 'var(--font-mono)',
                        minimap: { enabled: true, autohide: 'none' },
                        fontLigatures: true,
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                        mouseWheelZoom: true,
                        wordWrap: 'on',
                        fontSize: 16,
                    }}
                />
            )}
        </div>
    );
}

// Helper function to determine Monaco language from file extension
function getLanguageFromExtension(extension: string): string {
    const languageMap: Record<string, string> = {
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        html: 'html',
        css: 'css',
        json: 'json',
        md: 'markdown',
        py: 'python',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        cs: 'csharp',
        go: 'go',
        rs: 'rust',
        php: 'php',
        rb: 'ruby',
        sh: 'shell',
        sql: 'sql',
        yml: 'yaml',
        yaml: 'yaml',
        xml: 'xml',
    };

    return languageMap[extension.toLowerCase()] || 'plaintext';
}

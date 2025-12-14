import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useState } from 'react';
import type { FileNode } from '../types';
import { useFileExplorerStore } from '../store';

type CodeEditorProps = {
    content?: string;
    fileId?: string;
    file: FileNode | null;
};

export function CodeEditor({ content, fileId, file }: CodeEditorProps) {
    const updateFileContent = useFileExplorerStore(state => state.updateFileContent);
    const [draft, setDraft] = useState(content ?? '');

    useEffect(() => {
        setDraft(content ?? '');
    }, [content, fileId]);

    function handleEditorValidation(markers: readonly { message: string }[]) {
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }

    const handleEditorChange = useCallback((value: string | undefined) => {
        setDraft(value ?? '');
    }, []);

    useEffect(() => {
        if (!fileId) return;
        if (draft === (content ?? '')) return;

        const timeout = setTimeout(() => updateFileContent(fileId, draft), 300);
        return () => clearTimeout(timeout);
    }, [content, draft, fileId, updateFileContent]);

    return (
        <div className="h-full w-full border-2 border-black ">
            <Editor
                height="100%"
                theme="vs-dark"
                defaultLanguage="javascript"
                value={draft}
                onValidate={handleEditorValidation}
                onChange={handleEditorChange}
                options={{
                    fontFamily: 'var(--font-mono)',
                    minimap: { enabled: true, autohide: 'none' },
                    fontLigatures: true,
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    wordWrap: 'on',
                    fontSize: 16,
                    readOnly: !file,
                }}
            />
        </div>
    );
}

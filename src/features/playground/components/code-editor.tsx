import Editor from '@monaco-editor/react';
import { useCallback, useEffect, useRef } from 'react';
import type { FileNode } from '../types';
import { useFileExplorerStore } from '../store';

type CodeEditorProps = {
    content?: string;
    fileId?: string;
    file: FileNode | null;
};

export function CodeEditor({ content, fileId, file }: CodeEditorProps) {
    const updateFileContent = useFileExplorerStore(state => state.updateFileContent);
    const updateTimeoutRef = useRef<number | null>(null);

    function handleEditorValidation(markers: readonly { message: string }[]) {
        markers.forEach(marker => console.log('onValidate:', marker.message));
    }

    const handleEditorChange = useCallback(
        (value: string | undefined) => {
            if (!fileId) return;

            const nextContent = value ?? '';
            if (updateTimeoutRef.current) {
                window.clearTimeout(updateTimeoutRef.current);
            }
            updateTimeoutRef.current = window.setTimeout(() => updateFileContent(fileId, nextContent), 300);
        },
        [fileId, updateFileContent],
    );

    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                window.clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="h-full w-full border-2 border-black ">
            <Editor
                key={fileId ?? 'no-file'}
                height="100%"
                theme="vs-dark"
                defaultLanguage="javascript"
                defaultValue={content ?? ''}
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

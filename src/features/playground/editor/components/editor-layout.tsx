import { useEffect } from 'react';
import { EditorTabs } from './editor-tabs';
import { useQuery } from '@tanstack/react-query';
import { readFileContent } from '@features/playground/lib';
import { useFileEditorStore, useFileSystem } from '@features/playground/store';
import { CodeEditor, EmptyEditorState } from '@features/playground/editor/components';
import { getFileExtension, resolvePath } from '@features/playground/store/file-system';

async function getFile(activeFilePath: string | null) {
    if (!activeFilePath) {
        return {
            content: null,
            node: null,
        };
    }
    const node = resolvePath(activeFilePath, useFileSystem.getState().fsTree);

    if (node.kind == 'found') {
        const meta = node.meta;
        const content = await readFileContent(meta.ino);
        return {
            content,
            node: meta,
        };
    }

    return {
        content: null,
        node: null,
    };
}

export function EditorLayout() {
    const setCurrentFileContent = useFileEditorStore(state => state.setCurrentFileContent);
    const activeFilePath = useFileSystem(state => state.activeFile);
    const { data } = useQuery({
        queryKey: [activeFilePath],
        queryFn: () => getFile(activeFilePath),
        enabled: !!activeFilePath,
    });

    useEffect(() => {
        setCurrentFileContent(data?.content || null);
    }, [data?.content, setCurrentFileContent]);

    return (
        <section className="h-full min-h-0 w-full overflow-hidden">
            <EditorTabs />
            <div className="h-full min-h-0 w-full overflow-hidden">
                {activeFilePath == null ? (
                    <EmptyEditorState />
                ) : (
                    <CodeEditor
                        path={activeFilePath}
                        content={data?.content}
                        meta={data?.node}
                        extension={getFileExtension(activeFilePath)}
                    />
                )}
            </div>
        </section>
    );
}

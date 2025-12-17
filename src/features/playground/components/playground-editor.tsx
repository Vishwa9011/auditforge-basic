import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useFileEditorStore, useFileSystem } from '@features/playground/store';
import { CodeEditor, EmptyEditorState } from '@features/playground/editor/components';
import { resolvePath } from '@features/playground/store/file-system';
import { readFileContent } from '@features/playground/lib';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useUiToggle } from '@features/playground/hooks';

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

export function PlaygroundEditor() {
    const isAnalyzerOpen = useUiToggle('analyzer-panel').isEnabled;
    console.log('isAnalyzerOpen: ', isAnalyzerOpen);

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
        <div className="h-full min-h-0 w-full overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    {activeFilePath == null ? (
                        <EmptyEditorState />
                    ) : (
                        <CodeEditor
                            path={activeFilePath}
                            content={data?.content}
                            meta={data?.node}
                            isEditorOpen={!!activeFilePath}
                        />
                    )}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={isAnalyzerOpen ? 300 : 0} minSize={0} maxSize={600} collapsible>
                    <div className="bg-card h-full w-full p-4">Preview Area</div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

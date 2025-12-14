import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useFileExplorerStore, useFileSystem } from '../store';
import { CodeEditor } from './code-editor';
import { resolvePath } from '../store/file-system';
import { readFileContent } from '../lib';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

async function getFile(activeFilePath: string | null) {
    if (!activeFilePath) {
        return {
            content: null,
            node: null,
        };
    }
    const node = resolvePath(activeFilePath);

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
    const setCurrentFileContent = useFileExplorerStore(state => state.setCurrentFileContent);
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
                    <CodeEditor
                        path={activeFilePath}
                        content={data?.content}
                        meta={data?.node}
                        isEditorOpen={!!activeFilePath}
                    />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <div className="h-full w-full bg-black p-4">Preview Area</div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

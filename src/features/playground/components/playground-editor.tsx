import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { CodeEditor } from './code-editor';
import { useFileSystem } from '../store';

export function PlaygroundEditor() {
    const activeFile = useFileSystem(state => state.activeFile);
    console.log('activeFile: ', activeFile);

    return (
        <div className="h-full w-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <h1>No Code Available</h1>
                    {/* <CodeEditor file={activeFile} content={activeFile?.content} fileId={activeFile?.id} /> */}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <div className="h-full w-full bg-black p-4">Preview Area</div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

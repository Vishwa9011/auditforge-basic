import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useFileSystem } from '../store';

export function PlaygroundEditor() {
    const activeFilePath = useFileSystem(state => state.activeFile);
    console.log('activeFile: ', activeFilePath);

    return (
        <div className="h-full w-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <h1>No Code Available</h1>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <div className="h-full w-full bg-black p-4">Preview Area</div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

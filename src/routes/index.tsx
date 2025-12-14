import { createFileRoute } from '@tanstack/react-router';
import { FileExplorer, PlaygroundLayout } from '@/features/playground/components';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    return (
        <div className="h-dvh w-full overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="min-h-0">
                <ResizablePanel defaultSize={20} className="min-h-0 max-w-72">
                    <FileExplorer />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={80} className="min-h-0 w-full">
                    <PlaygroundLayout />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

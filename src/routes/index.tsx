import { createFileRoute } from '@tanstack/react-router';
import { FileExplorer } from '@features/playground/explorer';
import { OpenFileCommandDialog, PlaygroundLayout } from '@features/playground/components';
import { useSaveShortcut, useUiToggle, useUnsavedGuard } from '@features/playground/hooks';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useShortcuts } from '@/hooks/use-shortcuts';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    useSaveShortcut();
    useUnsavedGuard();
    useShortcuts();
    const { isEnabled } = useUiToggle('file-explorer-panel');

    return (
        <div className="h-full w-full overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="min-h-0">
                <ResizablePanel defaultSize={20} minSize={15} className="min-h-0 max-w-[70%]" hidden={!isEnabled}>
                    <FileExplorer />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={80} className="min-h-0 w-full">
                    <PlaygroundLayout />
                </ResizablePanel>
            </ResizablePanelGroup>
            <OpenFileCommandDialog />
        </div>
    );
}

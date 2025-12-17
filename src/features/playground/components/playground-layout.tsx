import { useUiToggle } from '../hooks';
import { Analyzer } from '../analyzer/components';
import { PlaygroundEditor } from '@features/playground/components/playground-editor';
import { PlaygroundHeader } from '@features/playground/components/playground-header';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export function PlaygroundLayout() {
    const isAnalyzerOpen = useUiToggle('analyzer-panel', true).isEnabled;
    console.log('isAnalyzerOpen: ', isAnalyzerOpen);

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
            <PlaygroundHeader />
            <div className="h-full min-h-0 w-full overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultValue={50}>
                        <PlaygroundEditor />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50} hidden={!isAnalyzerOpen}>
                        <Analyzer />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}

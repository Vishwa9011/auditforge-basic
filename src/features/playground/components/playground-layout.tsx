import { useUiToggle } from '../hooks';
import { AnalyzerLayout } from '../analyzer/components';
import { EditorLayout } from '../editor/components/editor-layout';
import { PlaygroundHeader } from '@features/playground/components/playground-header';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export function PlaygroundLayout() {
    const isAnalyzerOpen = useUiToggle('analyzer-panel', true).isEnabled;
    console.log('isAnalyzerOpen: ', isAnalyzerOpen);

    return (
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
            <PlaygroundHeader />
            <div className="h-[100dvh-40px] w-full overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultValue={50}>
                        <EditorLayout />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50} hidden={!isAnalyzerOpen}>
                        <AnalyzerLayout />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}

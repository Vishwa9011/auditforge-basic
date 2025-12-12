import { CodeEditor } from '@/features/playground/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
    component: Index,
});

function Index() {
    return (
        <div className="grid w-full grid-cols-[200px_1fr]">
            <div className="border-r-2 border-black p-4">File Explorer</div>
            <div className="h-screen w-full">
                <CodeEditor />
            </div>
        </div>
    );
}

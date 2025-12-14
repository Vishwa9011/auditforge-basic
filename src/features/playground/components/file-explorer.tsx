import { FileTree } from './file-tree';
import { useFileSystem } from '../store';

export function FileExplorer() {
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-border/60 bg-background sticky top-0 z-10 flex h-10 items-center border-b px-3 py-2  ">
                <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Explorer</h2>
            </div>

            <div className="scroll-thin min-h-0 flex-1 px-1 py-1">
                <RootFileTree />
            </div>
        </div>
    );
}

function RootFileTree() {
    const fileTree = useFileSystem(state => state.fsTree);
    return <FileTree path="/" name="/" node={fileTree.get('/')!} />;
}

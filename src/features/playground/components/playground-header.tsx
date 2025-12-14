import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Save, SaveAll, Sidebar, X } from 'lucide-react';
import { resolveFilename } from '../store/file-system';
import { resolvePath, useFileSystem } from '../store';

export function PlaygroundHeader() {
    const openFiles = useFileSystem(state => state.openFiles);
    const activeFile = useFileSystem(state => state.activeFile);
    const closeFile = useFileSystem(state => state.closeFile);

    const openFileTabs = useMemo(() => {
        return Array.from(openFiles)
            .map(filePath => {
                const resolved = resolvePath(filePath);
                if (resolved.kind == 'found') {
                    return {
                        ...resolved.meta,
                        path: filePath,
                        name: resolveFilename(filePath) || 'untitled',
                    };
                }
                return null;
            })
            .filter(v => v != null);
    }, [openFiles]);

    return (
        <header className="">
            <div className="flex h-10 items-center justify-between border-b px-2">
                <Button variant={'ghost'} size={'icon-sm'}>
                    <Sidebar className="size-4" />
                </Button>

                <div className="flex h-full shrink-0 items-center gap-1 px-2">
                    <Button variant="ghost" className="h-6 gap-1 !px-2">
                        <Save className="size-3.5" />
                        <span className="text-xs">Save</span>
                    </Button>

                    <Button variant="ghost" className="h-6 gap-1 !px-2">
                        <SaveAll className="size-3.5" />
                        <span className="text-xs">Save All</span>
                    </Button>

                    <Button variant="ghost" className="h-6 gap-1 !px-2">
                        <Bot className="size-3.5" />
                        <span className="text-xs">Analyze</span>
                    </Button>
                </div>
            </div>
            <div className="flex h-8 items-center overflow-hidden border-b">
                <div className="h-full min-w-0 flex-1">
                    <div className="scroll-thin flex h-full items-center overflow-x-auto overflow-y-hidden ">
                        {openFileTabs.map(file => (
                            <div
                                key={file.path}
                                className={cn(
                                    'hover:bg-accent/50 flex h-full cursor-pointer items-center gap-2 border-r pr-2 pl-3 whitespace-nowrap',
                                    file.path === activeFile && 'bg-accent/50 font-semibold',
                                )}
                            >
                                <span className="text-sm">{file.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:!bg-accent/80 h-5 w-5 rounded"
                                    onClick={() => closeFile(file.path)}
                                >
                                    <X className="size-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}

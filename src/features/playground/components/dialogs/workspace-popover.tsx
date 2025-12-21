import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useToggle } from '@features/playground/hooks';
import { useFileSystem } from '@features/playground/store';
import { getWorkspaceNames } from '@features/playground/store/file-system';

import { CreateWorkspaceDialog } from './create-workspace-dialog';
import { closeAllFilesOrConfirmUnsavedChanges } from '../../lib';

export function WorkspacePopover() {
    const [popoverOpen, setPopoverOpen] = useToggle(false);
    const fsTree = useFileSystem(state => state.fsTree);
    const selectedWorkspace = useFileSystem(state => state.selectedWorkspace);
    const selectWorkspace = useFileSystem(state => state.selectWorkspace);

    const workspaceNames = getWorkspaceNames(fsTree);

    const handleSelectWorkspace = (workspaceName: string) => {
        if (closeAllFilesOrConfirmUnsavedChanges()) return;
        selectWorkspace(workspaceName);
        setPopoverOpen(false);
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="secondary" className="w-full justify-between gap-2 font-normal">
                    <span className="truncate">{selectedWorkspace ?? 'Select workspace'}</span>
                    <ChevronDown className="size-4 opacity-70" />
                </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-80 p-1">
                <div className="text-muted-foreground px-2 py-1.5 text-[11px] font-semibold tracking-wide uppercase">
                    Workspaces
                </div>

                <div className="max-h-64 overflow-auto px-1 pb-1">
                    {workspaceNames.length === 0 ? (
                        <div className="text-muted-foreground px-2 py-6 text-sm">No workspaces yet.</div>
                    ) : (
                        workspaceNames.map(name => {
                            const isSelected = name === selectedWorkspace;
                            return (
                                <Button
                                    key={name}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        'w-full justify-start gap-2 font-normal',
                                        isSelected && 'bg-accent text-accent-foreground hover:bg-accent',
                                    )}
                                    onClick={() => handleSelectWorkspace(name)}
                                >
                                    <Check className={cn('size-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                                    <span className="truncate">{name}</span>
                                </Button>
                            );
                        })
                    )}
                </div>

                <Separator className="my-1" />

                <div className="p-1">
                    <CreateWorkspaceDialog onWorkspaceCreated={() => setPopoverOpen(false)} />
                </div>
            </PopoverContent>
        </Popover>
    );
}

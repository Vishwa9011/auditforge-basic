import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { WorkspacePopover } from '@features/playground/components/dialogs';
import { FolderPlus } from 'lucide-react';
import type { DestinationBase } from '../hooks/useContractImportModel';
import { sanitizeRelativeDirPath } from '../utils/source-parser';

type WorkspaceImportCardProps = {
    destinationBase: DestinationBase;
    onDestinationBaseChange: (value: DestinationBase) => void;
    destinationFolder: string;
    onDestinationFolderChange: (value: string) => void;
    suggestedDestinationFolder: string;
    openAfterImport: boolean;
    onOpenAfterImportChange: (value: boolean) => void;
    workspaceRoot: string | null;
    destinationDir: string;
    canImport: boolean;
    onImport: () => void;
    selectedWorkspace: string | null;
};

export function WorkspaceImportCard({
    destinationBase,
    onDestinationBaseChange,
    destinationFolder,
    onDestinationFolderChange,
    suggestedDestinationFolder,
    openAfterImport,
    onOpenAfterImportChange,
    workspaceRoot,
    destinationDir,
    canImport,
    onImport,
    selectedWorkspace,
}: WorkspaceImportCardProps) {
    const placeholder = suggestedDestinationFolder
        ? sanitizeRelativeDirPath(suggestedDestinationFolder)
        : 'contracts/contract';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add to workspace</CardTitle>
                <CardDescription>Create a folder in your current workspace and write the imported files.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-12">
                    <div className="space-y-2 md:col-span-4">
                        <Label>Destination</Label>
                        <Select
                            value={destinationBase}
                            onValueChange={v => onDestinationBaseChange(v as DestinationBase)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cwd">Current folder</SelectItem>
                                <SelectItem value="workspace-root" disabled={!workspaceRoot}>
                                    Workspace root
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 md:col-span-5">
                        <Label htmlFor="destination-folder">Folder name</Label>
                        <Input
                            id="destination-folder"
                            placeholder={placeholder}
                            value={destinationFolder}
                            onChange={e => onDestinationFolderChange(e.target.value)}
                        />
                    </div>

                    <div className="flex items-end gap-3 md:col-span-3">
                        <div className="flex items-center gap-2">
                            <Switch checked={openAfterImport} onCheckedChange={onOpenAfterImportChange} />
                            <div className="text-sm">
                                <div className="font-medium leading-none">Open after import</div>
                                <div className="text-muted-foreground text-xs">Focus the first created file</div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-12">
                    <div className="space-y-2 md:col-span-4">
                        <Label>Workspace</Label>
                        <WorkspacePopover />
                    </div>
                </div>

                <div className="text-muted-foreground text-sm">
                    Destination path: <span className="text-foreground font-medium">{destinationDir || '—'}</span>
                </div>

                <div className="flex items-center gap-3">
                    <Button type="button" className="gap-2" onClick={onImport} disabled={!canImport}>
                        <FolderPlus className="size-4" />
                        Add to workspace
                    </Button>

                    {!selectedWorkspace ? (
                        <div className="text-muted-foreground text-sm">Select a workspace from the picker first.</div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}


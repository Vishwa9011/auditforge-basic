import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { EtherscanResponse } from '../api';
import type { ContractSourceFile } from '../utils/source-parser';
import { ExplorerSummary } from './explorer-summary';
import { CodePanel } from './code-panel';

type ImportPreviewCardProps = {
    isLoading: boolean;
    explorerData: EtherscanResponse | null;
    warnings: string[];
    importFiles: ContractSourceFile[];
    activePath: string;
    onActivePathChange: (path: string) => void;
    activeFile: ContractSourceFile | null;
    activeLanguage: string;
    selectedWorkspace: string | null;
    cwd: string;
};

export function ImportPreviewCard({
    isLoading,
    explorerData,
    warnings,
    importFiles,
    activePath,
    onActivePathChange,
    activeFile,
    activeLanguage,
    selectedWorkspace,
    cwd,
}: ImportPreviewCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Review the files that will be added to your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="grid gap-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-[280px] w-full" />
                    </div>
                ) : null}

                {explorerData ? <ExplorerSummary data={explorerData} /> : null}

                {warnings.length > 0 ? (
                    <div className="text-muted-foreground rounded-md border px-3 py-2 text-sm">{warnings.join(' ')}</div>
                ) : null}

                {importFiles.length === 0 ? (
                    <div className="text-muted-foreground text-sm">
                        No sources yet. Fetch from the explorer to preview.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                Files ({importFiles.length})
                            </div>
                            <Select value={activePath} onValueChange={onActivePathChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select file" />
                                </SelectTrigger>
                                <SelectContent>
                                    {importFiles.map(file => (
                                        <SelectItem key={file.path} value={file.path}>
                                            {file.path}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="text-muted-foreground text-xs">
                                Workspace:{' '}
                                <span className="text-foreground font-medium">{selectedWorkspace ?? 'None selected'}</span>
                            </div>
                            <div className="text-muted-foreground text-xs">
                                Current folder: <span className="text-foreground font-medium">{cwd}</span>
                            </div>
                        </div>

                        <CodePanel
                            title="Preview"
                            filename={activeFile?.path ?? ''}
                            value={activeFile?.content ?? ''}
                            language={activeLanguage}
                            height={420}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

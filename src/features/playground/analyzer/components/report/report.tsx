import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Copy, FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AnalyzeResponse } from '../../types';
import { SecurityLevelBadge } from './badges';
import { IssueList } from './issue-list';

function safeCopy(text: string) {
    void navigator.clipboard?.writeText(text);
}

export function AnalysisReport({ data }: { data: AnalyzeResponse }) {
    const json = JSON.stringify(data, null, 2);
    const issuesFound = data.overview.issuesFound ?? data.issues.length;

    return (
        <div className="space-y-4 p-4">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="text-muted-foreground size-4" />
                                Audit Report
                            </CardTitle>
                            <CardDescription className="line-clamp-3">{data.summary}</CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <SecurityLevelBadge level={data.overview.securityLevel} />
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8">
                                        View JSON
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Raw JSON</DialogTitle>
                                        <DialogDescription>Useful for exporting or debugging.</DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end">
                                        <Button variant="outline" size="sm" onClick={() => safeCopy(json)}>
                                            <Copy className="size-4" />
                                            Copy
                                        </Button>
                                    </div>
                                    <pre className="bg-muted max-h-[60vh] overflow-auto rounded-md p-3 text-xs">
                                        {json}
                                    </pre>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <Separator className="mb-3" />
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Metric label="Solidity" value={data.overview.solidityVersion} />
                        <Metric label="Functions" value={data.overview.functions} />
                        <Metric label="Issues Found" value={issuesFound} />
                    </div>
                    <Separator className="my-3" />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-xs font-medium">By Severity</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <Metric label="Critical" value={data.overview.issuesBySeverity.critical} />
                                <Metric label="High" value={data.overview.issuesBySeverity.high} />
                                <Metric label="Medium" value={data.overview.issuesBySeverity.medium} />
                                <Metric label="Low" value={data.overview.issuesBySeverity.low} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-medium">By Category</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <Metric label="Security" value={data.overview.issuesByCategory.security} />
                                <Metric label="Logic" value={data.overview.issuesByCategory.logic} />
                                <Metric label="Gas" value={data.overview.issuesByCategory.gas} />
                                <Metric label="Style" value={data.overview.issuesByCategory.style} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <IssueList issues={data.issues} />
        </div>
    );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="bg-muted/30 rounded-md border px-3 py-2">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="mt-0.5 text-sm font-semibold">{value}</p>
        </div>
    );
}

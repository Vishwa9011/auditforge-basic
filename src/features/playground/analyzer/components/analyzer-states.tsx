import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

function normalizeError(error: unknown): string {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message || 'Unknown error';
    try {
        return JSON.stringify(error);
    } catch {
        return 'Unknown error';
    }
}

export function AnalyzerLoadingState({
    title = 'Analyzing contract…',
    description = 'Running security, logic, gas, and style checks. This can take a few seconds depending on the model.',
    footer,
}: {
    title?: string;
    description?: string;
    footer?: ReactNode;
}) {
    return (
        <div className="p-4">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <span className="bg-muted flex size-7 items-center justify-center rounded-md border">
                            <Loader2 className="text-muted-foreground size-4 animate-spin" />
                        </span>
                        {title}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">{footer ?? <LoadingSteps />}</CardContent>
            </Card>
        </div>
    );
}

function LoadingSteps() {
    return (
        <div className="space-y-2">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                    <span className="bg-muted size-2 rounded-full" />
                    Parsing file & building prompt
                </span>
                <span className="bg-muted/30 rounded px-1.5 py-0.5">in progress</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                    <span className="bg-muted size-2 rounded-full" />
                    Generating structured report (JSON)
                </span>
                <span className="bg-muted/30 rounded px-1.5 py-0.5">waiting</span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                    <span className="bg-muted size-2 rounded-full" />
                    Validating schema & rendering UI
                </span>
                <span className="bg-muted/30 rounded px-1.5 py-0.5">waiting</span>
            </div>
        </div>
    );
}

export function AnalyzerEmptyState() {
    return (
        <div className="p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-muted-foreground size-4" />
                        Ready to analyze
                    </CardTitle>
                    <CardDescription>Select a model, then click Analyze to generate a structured audit report.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground text-sm">
                        Tip: start with <span className="font-medium">medium</span> thinking for balanced results.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function AnalyzerErrorState({ error }: { error: unknown }) {
    const message = normalizeError(error);
    return (
        <div className="p-4">
            <Card className="border-destructive/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive size-4" />
                        Analysis failed
                    </CardTitle>
                    <CardDescription>Fix configuration (API key/host/model), then try again.</CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted max-h-[40vh] overflow-auto rounded-md p-3 text-xs">{message}</pre>
                </CardContent>
            </Card>
        </div>
    );
}


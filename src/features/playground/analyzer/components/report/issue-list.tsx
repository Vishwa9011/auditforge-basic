import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AnalyzeResponse } from '../../types';
import { CategoryBadge, SeverityBadge } from './badges';

type Issue = AnalyzeResponse['issues'][number];
type Category = Issue['category'] | 'all';
type Severity = Issue['severity'] | 'all';

function locationLabel(issue: Issue): string | null {
    if (!issue.location) return null;
    const parts: string[] = [];
    if (issue.location.function) parts.push(issue.location.function);
    if (typeof issue.location.line === 'number') parts.push(`L${issue.location.line}`);
    return parts.length ? parts.join(' · ') : null;
}

export function IssueList({ issues }: { issues: Issue[] }) {
    const [query, setQuery] = useState('');
    const [severity, setSeverity] = useState<Severity>('all');
    const [category, setCategory] = useState<Category>('all');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return issues.filter(i => {
            if (severity !== 'all' && i.severity !== severity) return false;
            if (category !== 'all' && i.category !== category) return false;
            if (!q) return true;
            return (
                i.title.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                i.recommendation.toLowerCase().includes(q)
            );
        });
    }, [issues, query, severity, category]);

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-medium">Issues ({filtered.length})</div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="text-muted-foreground absolute left-2 top-2 size-4" />
                        <Input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search issues…"
                            className="h-8 pl-8"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="text-muted-foreground size-4" />

                        <Select value={severity} onValueChange={v => setSeverity(v as Severity)}>
                            <SelectTrigger size="sm" className="h-8 w-36">
                                <SelectValue placeholder="Severity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All severities</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={category} onValueChange={v => setCategory(v as Category)}>
                            <SelectTrigger size="sm" className="h-8 w-36">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="logic">Logic</SelectItem>
                                <SelectItem value="gas">Gas</SelectItem>
                                <SelectItem value="style">Style</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center">
                        <p className="text-sm font-medium">No issues match your filters.</p>
                        <p className="text-muted-foreground mt-1 text-xs">Try clearing filters or changing the query.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2">
                    {filtered.map((issue, idx) => (
                        <IssueRow key={`${issue.title}-${idx}`} issue={issue} />
                    ))}
                </div>
            )}
        </div>
    );
}

function IssueRow({ issue }: { issue: Issue }) {
    const loc = locationLabel(issue);

    return (
        <Card>
            <CardContent className="p-0">
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="group h-auto w-full justify-start rounded-lg px-3 py-3 text-left"
                        >
                            <div className="flex w-full items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-2">
                                    <ChevronRight className="text-muted-foreground mt-0.5 size-4 shrink-0 group-data-[state=open]:hidden" />
                                    <ChevronDown className="text-muted-foreground mt-0.5 hidden size-4 shrink-0 group-data-[state=open]:block" />
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <SeverityBadge severity={issue.severity} />
                                            <CategoryBadge category={issue.category} />
                                            {loc ? (
                                                <span className="text-muted-foreground text-xs">{loc}</span>
                                            ) : null}
                                        </div>
                                        <p className="mt-1 truncate text-sm font-medium">{issue.title}</p>
                                    </div>
                                </div>
                                <span className="text-muted-foreground shrink-0 text-xs">{issue.severity.toUpperCase()}</span>
                            </div>
                        </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="px-3 pb-3">
                        <Separator className="mb-3" />

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs font-medium">Description</p>
                                <p className={cn('text-muted-foreground text-sm leading-relaxed')}>{issue.description}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium">Recommendation</p>
                                <p className={cn('text-muted-foreground text-sm leading-relaxed')}>{issue.recommendation}</p>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </CardContent>
        </Card>
    );
}

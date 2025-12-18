import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AnalyzeResponse } from '../../types';

type Severity = AnalyzeResponse['overview']['securityLevel'];
type Category = AnalyzeResponse['issues'][number]['category'];

const severityStyles: Record<Severity, { label: string; className: string }> = {
    low: { label: 'Low', className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' },
    medium: { label: 'Medium', className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200' },
    high: { label: 'High', className: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200' },
    critical: { label: 'Critical', className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200' },
};

const categoryStyles: Record<Category, { label: string; className: string }> = {
    security: { label: 'Security', className: 'border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-200' },
    gas: { label: 'Gas', className: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200' },
    logic: { label: 'Logic', className: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200' },
    style: { label: 'Style', className: 'border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200' },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
    const s = severityStyles[severity];
    return <Badge variant="outline" className={cn('border', s.className, className)}>{s.label}</Badge>;
}

export function CategoryBadge({ category, className }: { category: Category; className?: string }) {
    const c = categoryStyles[category];
    return <Badge variant="outline" className={cn('border', c.className, className)}>{c.label}</Badge>;
}

export function SecurityLevelBadge({ level, className }: { level: Severity; className?: string }) {
    return <SeverityBadge severity={level} className={cn('text-xs', className)} />;
}


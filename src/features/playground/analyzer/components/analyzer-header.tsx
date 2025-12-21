import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAnalyzerSettings } from '../store/analyzer-settings.store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Bot, Brain, Check, ChevronDown, Cpu, Loader2, Play, Settings2, Shapes } from 'lucide-react';
import { THINKING_LEVELS, getAllowedThinkingLevels, getModelSuggestions, type ThinkingLevel } from '../llm/config';

type AnalyzerHeaderProps = {
    isAnalyzing: boolean;
    onAnalyze: () => void;
};

type HeaderPopoverContextValue = {
    close: () => void;
};

const HeaderPopoverContext = createContext<HeaderPopoverContextValue | null>(null);

const PROVIDER_OPTIONS = [
    { id: 'ollama', label: 'Ollama' },
    { id: 'openai', label: 'OpenAI' },
] as const;

export function AnalyzerHeader({ onAnalyze, isAnalyzing }: AnalyzerHeaderProps) {
    const { provider, modelByProvider, thinkingLevel, setProvider, setModel, setThinkingLevel } = useAnalyzerSettings();
    const modelId = modelByProvider[provider] ?? '';

    const allowedThinkingLevels = useMemo(() => getAllowedThinkingLevels(provider, modelId), [provider, modelId]);
    const suggestions = useMemo(() => getModelSuggestions(provider), [provider]);

    const providerLabel = PROVIDER_OPTIONS.find(p => p.id === provider)?.label ?? provider;
    const modelLabel =
        suggestions.find(m => m.id === modelId)?.label ?? (modelId.trim() ? modelId.trim() : 'Select model');
    const analyzeIcon = isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />;

    return (
        <div className="border-b px-2 py-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <HeaderTitle />

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
                    <HeaderPopover
                        disabled={isAnalyzing}
                        ariaLabel="Select provider"
                        tooltip="Select provider"
                        icon={<Cpu className="size-4" />}
                        valueLabel={providerLabel}
                    >
                        <PopoverTitle>Provider</PopoverTitle>
                        {PROVIDER_OPTIONS.map(p => (
                            <PopoverItem key={p.id} selected={p.id === provider} onSelect={() => setProvider(p.id)}>
                                {p.label}
                            </PopoverItem>
                        ))}
                    </HeaderPopover>

                    <HeaderPopover
                        disabled={isAnalyzing}
                        ariaLabel="Select model"
                        tooltip="Select model"
                        icon={<Shapes className="size-4" />}
                        valueLabel={modelLabel}
                    >
                        <PopoverTitle>Model</PopoverTitle>
                        {suggestions.map(m => (
                            <PopoverItem key={m.id} selected={m.id === modelId} onSelect={() => setModel(m.id)}>
                                {m.label}
                            </PopoverItem>
                        ))}
                    </HeaderPopover>

                    <HeaderPopover
                        disabled={isAnalyzing}
                        ariaLabel="Select thinking level"
                        tooltip="Select thinking level"
                        icon={<Brain className="size-4" />}
                        valueLabel={thinkingLevel}
                    >
                        <PopoverTitle>Thinking</PopoverTitle>
                        {THINKING_LEVELS.map(level => (
                            <PopoverItem
                                key={level}
                                selected={level === thinkingLevel}
                                disabled={!allowedThinkingLevels.includes(level)}
                                onSelect={() => setThinkingLevel(level as ThinkingLevel)}
                            >
                                {level}
                            </PopoverItem>
                        ))}
                    </HeaderPopover>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon-sm" asChild aria-label="Open analyzer settings">
                                <Link to="/settings" search={{ tab: 'analyzer' as const }}>
                                    <Settings2 className="size-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={6}>
                            Analyzer settings
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onAnalyze}
                                disabled={isAnalyzing}
                                aria-busy={isAnalyzing}
                            >
                                {analyzeIcon}
                                {isAnalyzing ? 'Analyzing…' : 'Analyze'}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={6}>
                            Run analysis
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}

function HeaderPopover({
    disabled,
    ariaLabel,
    tooltip,
    icon,
    valueLabel,
    children,
}: {
    disabled?: boolean;
    ariaLabel: string;
    tooltip: string;
    icon: ReactNode;
    valueLabel: string;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    const ctx = useMemo<HeaderPopoverContextValue>(() => ({ close }), [close]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            aria-label={ariaLabel}
                            disabled={disabled}
                            className={cn(
                                'text-muted-foreground hover:text-foreground hover:bg-accent bg-background inline-flex h-8 min-w-0 cursor-pointer items-center gap-2 rounded-md border px-2 text-sm shadow-xs transition-colors',
                                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                                'disabled:pointer-events-none disabled:opacity-50',
                            )}
                        >
                            {icon}
                            <span className="max-w-36 min-w-0 truncate text-left sm:max-w-48">{valueLabel}</span>
                            <ChevronDown className="size-3.5 opacity-70" />
                        </button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                    {tooltip}
                </TooltipContent>
            </Tooltip>
            <PopoverContent
                align="start"
                sideOffset={8}
                collisionPadding={8}
                className="w-[min(18rem,calc(100vw-2rem))] p-1"
            >
                <HeaderPopoverContext.Provider value={ctx}>
                    <div className="space-y-0.5">{children}</div>
                </HeaderPopoverContext.Provider>
            </PopoverContent>
        </Popover>
    );
}

function HeaderTitle() {
    return (
        <div className="flex items-center gap-2 text-sm font-medium">
            <Bot className="size-5 text-purple-500" />
            <p className="leading-none">Analysis Results</p>
        </div>
    );
}

function PopoverTitle({ children }: { children: ReactNode }) {
    return <div className="text-muted-foreground px-2 py-1 text-xs font-medium">{children}</div>;
}

function PopoverItem({
    children,
    selected,
    disabled,
    onSelect,
}: {
    children: ReactNode;
    selected?: boolean;
    disabled?: boolean;
    onSelect: () => void;
}) {
    const ctx = useContext(HeaderPopoverContext);

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => {
                onSelect();
                ctx?.close();
            }}
            className={cn(
                'hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                'disabled:pointer-events-none disabled:opacity-50',
            )}
        >
            <span className="min-w-0 truncate">{children}</span>
            {selected ? <Check className="text-muted-foreground size-4" /> : <span className="size-4" />}
        </button>
    );
}

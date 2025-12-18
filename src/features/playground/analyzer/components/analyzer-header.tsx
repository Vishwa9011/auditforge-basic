import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Bot, Brain, Check, ChevronDown, Cpu, Loader2, Play, Settings2, Shapes } from 'lucide-react';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { MODEL_SUGGESTIONS, THINKING_LEVELS, getAllowedThinkingLevels, type ThinkingLevel } from '../llm/config';
import { useAnalyzerSettings } from '../store/analyzer-settings.store';

type AnalyzerHeaderProps = {
    isAnalyzing: boolean;
    onAnalyze: () => void;
};

type HeaderPopoverContextValue = {
    close: () => void;
};

const HeaderPopoverContext = createContext<HeaderPopoverContextValue | null>(null);

export function AnalyzerHeader({ onAnalyze, isAnalyzing }: AnalyzerHeaderProps) {
    const { provider, modelByProvider, thinkingLevel, setProvider, setModel, setThinkingLevel } = useAnalyzerSettings();

    const icon = isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />;
    const model = modelByProvider[provider] ?? '';
    const allowedThinkingLevels = getAllowedThinkingLevels(provider, model);
    const suggestedModels = MODEL_SUGGESTIONS[provider];
    const hasModelInSuggestions = suggestedModels.some(m => m.id === model);

    return (
        <div className="flex h-10 items-center justify-between gap-4 border-b px-2">
            <div className="flex items-center gap-2 text-sm font-medium">
                <Bot className="size-5 text-purple-500" />
                <p>Analysis Results</p>
            </div>

            <div className="flex items-center gap-2">
                <HeaderPopover
                    disabled={isAnalyzing}
                    ariaLabel="Select provider"
                    tooltip="Select provider"
                    icon={<Cpu className="size-4" />}
                >
                    <PopoverTitle>Provider</PopoverTitle>
                    <PopoverItem selected={provider === 'ollama'} onSelect={() => setProvider('ollama')}>
                        Ollama
                    </PopoverItem>
                    <PopoverItem selected={provider === 'openai'} onSelect={() => setProvider('openai')}>
                        OpenAI
                    </PopoverItem>
                </HeaderPopover>

                <HeaderPopover
                    disabled={isAnalyzing}
                    ariaLabel="Select model"
                    tooltip="Select model"
                    icon={<Shapes className="size-4" />}
                >
                    <PopoverTitle>Select model</PopoverTitle>
                    {!hasModelInSuggestions && model.trim() ? (
                        <PopoverItem selected onSelect={() => setModel(model)}>
                            {`Custom: ${model}`}
                        </PopoverItem>
                    ) : null}
                    {suggestedModels.map(m => (
                        <PopoverItem key={m.id} selected={m.id === model} onSelect={() => setModel(m.id)}>
                            {m.label}
                        </PopoverItem>
                    ))}
                </HeaderPopover>

                <HeaderPopover
                    disabled={isAnalyzing}
                    ariaLabel="Select thinking level"
                    tooltip="Select thinking level"
                    icon={<Brain className="size-4" />}
                >
                    <PopoverTitle>Thinking level</PopoverTitle>
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
                        <Button
                            variant="outline"
                            size="icon-sm"
                            className="h-7"
                            asChild
                            aria-label="Open analyzer settings"
                        >
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
                            className="h-7 !px-2 text-sm"
                            onClick={onAnalyze}
                            disabled={isAnalyzing}
                        >
                            {icon}
                            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={6}>
                        Run analysis
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}

function HeaderPopover({
    disabled,
    ariaLabel,
    tooltip,
    icon,
    children,
}: {
    disabled?: boolean;
    ariaLabel: string;
    tooltip: string;
    icon: ReactNode;
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const ctx = useMemo<HeaderPopoverContextValue>(() => ({ close: () => setOpen(false) }), [setOpen]);

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
                                'text-muted-foreground hover:text-foreground hover:bg-accent/60 inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-1.5 transition-colors',
                                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                                'disabled:pointer-events-none disabled:opacity-50',
                            )}
                        >
                            {icon}
                            <ChevronDown className="size-3.5 opacity-70" />
                        </button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                    {tooltip}
                </TooltipContent>
            </Tooltip>
            <PopoverContent align="start" className="w-48 p-1">
                <HeaderPopoverContext.Provider value={ctx}>
                    <div className="space-y-0.5">{children}</div>
                </HeaderPopoverContext.Provider>
            </PopoverContent>
        </Popover>
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

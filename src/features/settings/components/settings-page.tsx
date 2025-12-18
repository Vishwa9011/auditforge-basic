import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Cog, Download, ExternalLink, RotateCcw, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { THINKING_LEVELS, type LlmProvider, type ThinkingLevel, MODEL_SUGGESTIONS } from '@features/playground/analyzer/llm/config';
import { useAnalyzerSettings } from '@features/playground/analyzer/store/analyzer-settings.store';
import { useEditorSettings, type EditorFontFamily } from '../store/editor-settings.store';

export type SettingsTab = 'editor' | 'analyzer';

export function SettingsPage({ initialTab = 'editor' }: { initialTab?: SettingsTab }) {
    const normalizedTab = useMemo(() => (initialTab === 'analyzer' ? 'analyzer' : 'editor'), [initialTab]);
    const [tab, setTab] = useState<SettingsTab>(normalizedTab);

    useEffect(() => {
        setTab(normalizedTab);
    }, [normalizedTab]);

    return (
        <div className="flex h-dvh w-full flex-1 flex-col overflow-hidden">
            <SettingsTopBar />
            <div className="min-h-0 flex-1 overflow-auto">
                <div className="mx-auto w-full max-w-5xl px-4 py-4">
                    <Tabs value={tab} onValueChange={v => setTab(v as SettingsTab)} className="w-full">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="md:w-56">
                                <TabsList className="grid w-full grid-cols-2 md:hidden">
                                    <TabsTrigger value="editor">Editor</TabsTrigger>
                                    <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
                                </TabsList>

                                <div className="hidden md:block">
                                    <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                                        Settings
                                    </div>
                                    <div className="space-y-1">
                                        <SidebarTabButton active={tab === 'editor'} onClick={() => setTab('editor')} label="Editor" />
                                        <SidebarTabButton active={tab === 'analyzer'} onClick={() => setTab('analyzer')} label="Analyzer" />
                                    </div>
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <TabsContent value="editor" className="mt-0">
                                    <EditorSettingsSection />
                                </TabsContent>
                                <TabsContent value="analyzer" className="mt-0">
                                    <AnalyzerSettingsSection />
                                </TabsContent>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function SidebarTabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'hover:bg-accent text-muted-foreground w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                active && 'bg-accent text-accent-foreground',
            )}
        >
            {label}
        </button>
    );
}

function SettingsTopBar() {
    return (
        <div className="bg-background sticky top-0 z-10 border-b">
            <div className="flex h-12 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <span className="bg-muted flex size-8 items-center justify-center rounded-md border">
                        <Cog className="text-muted-foreground size-4" />
                    </span>
                    <div className="leading-tight">
                        <div className="text-sm font-semibold">Settings</div>
                        <div className="text-muted-foreground text-xs">Configure editor and analyzer behavior</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Select value="local" onValueChange={() => {}}>
                        <SelectTrigger size="sm" className="h-8 w-28">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="local">Local</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" className="h-8" disabled>
                        <Upload className="size-4" />
                        Import
                    </Button>
                    <Button variant="outline" size="sm" className="h-8" disabled>
                        <Download className="size-4" />
                        Export
                    </Button>

                    <Button variant="outline" size="sm" className="h-8" asChild>
                        <Link to="/" aria-label="Back to editor" title="Back to editor">
                            <ExternalLink className="size-4" />
                            Back
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

function EditorSettingsSection() {
    const {
        fontFamily,
        fontSize,
        lineHeight,
        fontLigatures,
        lineNumbers,
        wordWrap,
        minimap,
        setFontFamily,
        setFontSize,
        setLineHeight,
        setFontLigatures,
        setLineNumbers,
        setWordWrap,
        setMinimap,
        reset,
    } = useEditorSettings();

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Editor</CardTitle>
                    <CardDescription>Typography and layout options for the code editor.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Font family</Label>
                            <Select value={fontFamily} onValueChange={v => setFontFamily(v as EditorFontFamily)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                                    <SelectItem value="Fira Code">Fira Code</SelectItem>
                                    <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                                    <SelectItem value="Menlo">Menlo</SelectItem>
                                    <SelectItem value="Monaco">Monaco</SelectItem>
                                    <SelectItem value="Consolas">Consolas</SelectItem>
                                    <SelectItem value="System Mono">System Mono</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-xs">
                                Applied immediately to Monaco editor.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Font size</Label>
                                <span className="text-muted-foreground text-xs">{fontSize}px</span>
                            </div>
                            <Slider value={[fontSize]} min={12} max={24} step={1} onValueChange={v => setFontSize(v[0] ?? fontSize)} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Line height</Label>
                                <span className="text-muted-foreground text-xs">{lineHeight}px</span>
                            </div>
                            <Slider value={[lineHeight]} min={16} max={32} step={1} onValueChange={v => setLineHeight(v[0] ?? lineHeight)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Feature toggles</Label>
                            <div className="space-y-3">
                                <ToggleRow
                                    label="Font ligatures"
                                    description="Enables ligatures for supported fonts (e.g. Fira Code)."
                                    checked={fontLigatures}
                                    onCheckedChange={setFontLigatures}
                                />
                                <ToggleRow
                                    label="Line numbers"
                                    description="Show line numbers in the gutter."
                                    checked={lineNumbers}
                                    onCheckedChange={setLineNumbers}
                                />
                                <ToggleRow
                                    label="Word wrap"
                                    description="Wrap long lines within the viewport."
                                    checked={wordWrap}
                                    onCheckedChange={setWordWrap}
                                />
                                <ToggleRow
                                    label="Minimap"
                                    description="Show minimap on the right side of the editor."
                                    checked={minimap}
                                    onCheckedChange={setMinimap}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={reset}>
                            <RotateCcw className="size-4" />
                            Reset to defaults
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function AnalyzerSettingsSection() {
    const {
        provider,
        modelByProvider,
        thinkingLevel,
        openaiApiKey,
        openaiBaseUrl,
        ollamaHost,
        setProvider,
        setModel,
        setThinkingLevel,
        setOpenaiApiKey,
        setOpenaiBaseUrl,
        setOllamaHost,
        reset,
    } = useAnalyzerSettings();

    const model = modelByProvider[provider] ?? '';

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Analyzer</CardTitle>
                    <CardDescription>Configure which model runs and how detailed the audit should be.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select value={provider} onValueChange={v => setProvider(v as LlmProvider)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ollama">Ollama</SelectItem>
                                    <SelectItem value="openai">OpenAI</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Thinking level</Label>
                            <Select value={thinkingLevel} onValueChange={v => setThinkingLevel(v as ThinkingLevel)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Thinking level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {THINKING_LEVELS.map(level => (
                                        <SelectItem key={level} value={level}>
                                            {level}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Model</Label>
                            <Input
                                placeholder={provider === 'ollama' ? 'llama3.1:8b' : 'gpt-4o-mini'}
                                value={model}
                                onChange={e => setModel(e.target.value)}
                                list={`settings-analyzer-model-${provider}`}
                            />
                            <datalist id={`settings-analyzer-model-${provider}`}>
                                {MODEL_SUGGESTIONS[provider].map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.label}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>OpenAI API key</Label>
                            <Input
                                type="password"
                                placeholder="sk-..."
                                value={openaiApiKey}
                                onChange={e => setOpenaiApiKey(e.target.value)}
                            />
                            <p className="text-muted-foreground text-xs">Stored locally in your browser.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>OpenAI base URL (optional)</Label>
                            <Input
                                placeholder="https://api.openai.com/v1"
                                value={openaiBaseUrl}
                                onChange={e => setOpenaiBaseUrl(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Ollama host</Label>
                            <Input
                                placeholder="http://localhost:11434"
                                value={ollamaHost}
                                onChange={e => setOllamaHost(e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={reset}>
                            <RotateCcw className="size-4" />
                            Reset to defaults
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ToggleRow({
    label,
    description,
    checked,
    onCheckedChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

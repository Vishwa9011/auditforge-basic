import { Label } from '@/components/ui/label';
import { useAnalyzerSettings } from '@/features/playground/analyzer/store/analyzer-settings.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    MODEL_SUGGESTIONS,
    THINKING_LEVELS,
    type LlmProvider,
    type ThinkingLevel,
} from '@/features/playground/analyzer/llm/config';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { ToggleRow } from './toggle-row';
import { useState } from 'react';

export function AnalyzerSettingsSection() {
    const {
        provider,
        modelByProvider,
        thinkingLevel,
        openaiApiKey,
        ollamaHost,
        setProvider,
        setModel,
        setThinkingLevel,
        setOpenaiApiKey,
        setOllamaHost,
        reset,
    } = useAnalyzerSettings();

    const model = modelByProvider[provider] ?? '';
    const [showApiKey, setShowApiKey] = useState(false);

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
                                type={showApiKey ? 'text' : 'password'}
                                placeholder="sk-..."
                                value={openaiApiKey}
                                onChange={e => setOpenaiApiKey(e.target.value)}
                                autoComplete="off"
                            />
                            <ToggleRow
                                label="Show API key"
                                description="Stored locally in your browser."
                                checked={showApiKey}
                                onCheckedChange={setShowApiKey}
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

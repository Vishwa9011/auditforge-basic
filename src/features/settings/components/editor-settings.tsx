import { ToggleRow } from './toggle-row';
import { RotateCcw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FONT_FAMILIES, type EditorFontFamilyId } from '@/features/playground/editor';
import { useEditorSettings } from '../store/editor-settings.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function EditorSettingsSection() {
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
                            <Select value={fontFamily} onValueChange={v => setFontFamily(v as EditorFontFamilyId)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent>
                                    {FONT_FAMILIES.map(({ id, label }) => (
                                        <SelectItem value={id}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-xs">Applied immediately to Monaco editor.</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Font size</Label>
                                <span className="text-muted-foreground text-xs">{fontSize}px</span>
                            </div>
                            <Slider
                                value={[fontSize]}
                                min={12}
                                max={24}
                                step={1}
                                onValueChange={v => setFontSize(v[0] ?? fontSize)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Line height</Label>
                                <span className="text-muted-foreground text-xs">{lineHeight}px</span>
                            </div>
                            <Slider
                                value={[lineHeight]}
                                min={16}
                                max={32}
                                step={1}
                                onValueChange={v => setLineHeight(v[0] ?? lineHeight)}
                            />
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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAnalyzerSettings } from '@/features/playground/analyzer/store/analyzer-settings.store';
import { useEditorSettings } from '../store/editor-settings.store';
import { useImportSettings } from '../store/import-settings.store';
import { Moon, RotateCcw, Sun, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';

type ThemeValue = 'system' | 'light' | 'dark';

export function PreferencesSettingsSection() {
    const { theme, setTheme } = useTheme();
    const currentTheme = (theme ?? 'system') as ThemeValue;

    const resetEditor = useEditorSettings(state => state.reset);
    const resetAnalyzer = useAnalyzerSettings(state => state.reset);
    const resetImport = useImportSettings(state => state.reset);

    function resetAll() {
        setTheme('system');
        resetEditor();
        resetAnalyzer();
        resetImport();
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Appearance and general behavior for this device.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <Select value={currentTheme} onValueChange={v => setTheme(v as ThemeValue)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="system">
                                        <span className="flex items-center gap-2">
                                            <SunMoon className="size-4" />
                                            System
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="light">
                                        <span className="flex items-center gap-2">
                                            <Sun className="size-4" />
                                            Light
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <span className="flex items-center gap-2">
                                            <Moon className="size-4" />
                                            Dark
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-xs">System uses your OS appearance preference.</p>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <RotateCcw className="size-4" />
                                    Reset all local settings
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-sm">
                                <AlertDialogHeader className="gap-1">
                                    <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This resets Preferences, Editor, Analyzer, and Import settings on this device.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-2 flex-col gap-2 sm:flex-col sm:justify-start">
                                    <AlertDialogCancel asChild>
                                        <Button type="button" variant="secondary" className="w-full justify-center">
                                            Cancel
                                        </Button>
                                    </AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="w-full justify-center"
                                            onClick={resetAll}
                                        >
                                            Reset everything
                                        </Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

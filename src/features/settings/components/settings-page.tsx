import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useState } from 'react';
import { ImportSettingsSection } from './import-settings';
import { EditorSettingsSection } from './editor-settings';
import { ShortcutsSettingsSection } from './shortcut-settings';
import { AnalyzerSettingsSection } from './analyzer-settings';
import { PreferencesSettingsSection } from './preferences-settings';
import { Cog, Download, ExternalLink, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type SettingsTab = 'preferences' | 'editor' | 'analyzer' | 'import' | 'shortcuts';

export function SettingsPage({ initialTab = 'editor' }: { initialTab?: SettingsTab }) {
    const normalizedTab = useMemo(() => {
        if (initialTab === 'preferences') return 'preferences';
        if (initialTab === 'analyzer') return 'analyzer';
        if (initialTab === 'import') return 'import';
        if (initialTab === 'shortcuts') return 'shortcuts';
        return 'editor';
    }, [initialTab]);
    const [tab, setTab] = useState<SettingsTab>(normalizedTab);

    useEffect(() => {
        setTab(normalizedTab);
    }, [normalizedTab]);

    return (
        <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
            <SettingsTopBar />
            <div className="min-h-0 flex-1 overflow-auto">
                <div className="mx-auto w-full max-w-5xl px-4 py-4">
                    <Tabs value={tab} onValueChange={v => setTab(v as SettingsTab)} className="w-full">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="md:w-56">
                                <TabsList className="grid w-full grid-cols-2 gap-1 min-[520px]:grid-cols-5 md:hidden">
                                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                                    <TabsTrigger value="editor">Editor</TabsTrigger>
                                    <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
                                    <TabsTrigger value="import">Import</TabsTrigger>
                                    <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
                                </TabsList>

                                <div className="hidden md:block">
                                    <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                                        Settings
                                    </div>
                                    <div className="space-y-1">
                                        <SidebarTabButton
                                            active={tab === 'preferences'}
                                            onClick={() => setTab('preferences')}
                                            label="Preferences"
                                        />
                                        <SidebarTabButton
                                            active={tab === 'editor'}
                                            onClick={() => setTab('editor')}
                                            label="Editor"
                                        />
                                        <SidebarTabButton
                                            active={tab === 'analyzer'}
                                            onClick={() => setTab('analyzer')}
                                            label="Analyzer"
                                        />
                                        <SidebarTabButton
                                            active={tab === 'import'}
                                            onClick={() => setTab('import')}
                                            label="Import"
                                        />
                                        <SidebarTabButton
                                            active={tab === 'shortcuts'}
                                            onClick={() => setTab('shortcuts')}
                                            label="Shortcuts"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <TabsContent value="preferences" className="mt-0">
                                    <PreferencesSettingsSection />
                                </TabsContent>
                                <TabsContent value="editor" className="mt-0">
                                    <EditorSettingsSection />
                                </TabsContent>
                                <TabsContent value="analyzer" className="mt-0">
                                    <AnalyzerSettingsSection />
                                </TabsContent>
                                <TabsContent value="import" className="mt-0">
                                    <ImportSettingsSection />
                                </TabsContent>
                                <TabsContent value="shortcuts" className="mt-0">
                                    <ShortcutsSettingsSection />
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
                        <div className="text-muted-foreground text-xs">Configure preferences and app defaults</div>
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

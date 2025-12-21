import { Kbd } from '@/components/ui/kbd';
import { APP_SHORTCUTS, EMPTY_STATE_SHORTCUT_IDS, type AppShortcut } from '@/lib/app-shortcuts';
import { usePlatform } from '@/hooks/use-platform';

function KeyCombo({ keys }: { keys: readonly string[] }) {
    return (
        <span className="inline-flex items-center gap-2">
            {keys.map((key, index) => (
                <span key={`${key}-${index}`} className="inline-flex items-center">
                    {/* {index > 0 && <span className="text-muted-foreground/60 px-1 text-[10px]">+</span>} */}
                    <Kbd className={key === '⌘' ? 'text-[13px]' : undefined}>{key}</Kbd>
                </span>
            ))}
        </span>
    );
}

function ShortcutRow({ item, keymap }: { item: AppShortcut; keymap: 'mac' | 'windows' }) {
    const keys = keymap === 'mac' ? item.macKeys : item.windowsKeys;
    return (
        <div className="flex items-center justify-between gap-6">
            <span className="text-muted-foreground text-xs">{item.label}</span>
            <KeyCombo keys={keys} />
        </div>
    );
}

export function EmptyEditorState() {
    const shortcuts = APP_SHORTCUTS.filter(shortcut => EMPTY_STATE_SHORTCUT_IDS.includes(shortcut.id));
    const platform = usePlatform();
    const keymap: 'mac' | 'windows' = platform === 'mac' ? 'mac' : 'windows';

    return (
        <div className="bg-accent/10 pointer-events-none flex h-full min-h-0 items-center justify-center select-none">
            <div className="x pointer-events-none flex flex-col items-center gap-4">
                <img
                    src="/logo-2.png"
                    alt="AuditForge"
                    className="pointer-events-none w-92 object-contain opacity-60"
                />

                <div className="pointer-events-none mt-2 space-y-2">
                    {shortcuts.map(shortcut => (
                        <ShortcutRow key={shortcut.id} item={shortcut} keymap={keymap} />
                    ))}
                </div>
            </div>
        </div>
    );
}

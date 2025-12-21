export const SHORTCUT_COMBINATION_KEYS = [
    'Ctrl',
    'Shift',
    'Alt',
    'P',
    'N',
    'B',
    'O',
    'F',
    'S',
    'Z',
    'Y',
    'X',
    'C',
    'V',
    'A',
    'W',
    'Q',
    'D',
    ',',
    'Enter',
] as const;
export const OPERATIONAL_KEYS = ['Ctrl', 'Shift', 'Alt'] as const;

export type ShortcutKey = (typeof SHORTCUT_COMBINATION_KEYS)[number];
export type OperationalKey = (typeof OPERATIONAL_KEYS)[number];

export type AppShortcut = {
    id: string;
    label: string;
    macKeys: readonly string[];
    windowsKeys: readonly ShortcutKey[];
};

export const APP_SHORTCUTS = [
    {
        id: 'open-file',
        label: 'Open file',
        macKeys: ['⌘', 'P'],
        windowsKeys: ['Ctrl', 'P'],
    },
    { id: 'new-file', label: 'Create new file', macKeys: ['⌘', 'N'], windowsKeys: ['Ctrl', 'N'] },
    {
        id: 'open-file-explorer',
        label: 'Open file explorer',
        macKeys: ['⌘', 'B'],
        windowsKeys: ['Ctrl', 'B'],
    },
    {
        id: 'open-ai-analysis',
        label: 'Open analyzer panel',
        macKeys: ['⌘', 'Enter'],
        windowsKeys: ['Ctrl', 'Enter'],
    },
    { id: 'open-settings', label: 'Open settings', macKeys: ['⌘', ','], windowsKeys: ['Ctrl', ','] },
    { id: 'close-file', label: 'Close file', macKeys: ['⌘', 'D'], windowsKeys: ['Ctrl', 'D'] },
    { id: 'save-file', label: 'Save file', macKeys: ['⌘', 'S'], windowsKeys: ['Ctrl', 'S'] },
] satisfies readonly AppShortcut[];

export const EMPTY_STATE_SHORTCUT_IDS = ['open-file', 'new-file', 'open-file-explorer'] satisfies ReadonlyArray<
    AppShortcut['id']
>;

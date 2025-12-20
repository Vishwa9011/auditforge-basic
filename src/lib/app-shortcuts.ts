export const APP_SHORTCUTS = [
    { id: 'open-file', label: 'Open file', macKeys: ['⌘', 'P'], windowsKeys: ['Ctrl', 'P'] },
    { id: 'new-file', label: 'Create new file', macKeys: ['⌘', 'N'], windowsKeys: ['Ctrl', 'N'] },
    {
        id: 'new-folder',
        label: 'Create new folder',
        macKeys: ['⌘', 'Shift', 'N'],
        windowsKeys: ['Ctrl', 'Shift', 'N'],
    },
    { id: 'run-analysis', label: 'Run AI analysis', macKeys: ['⌘', 'Enter'], windowsKeys: ['Ctrl', 'Enter'] },
    { id: 'open-settings', label: 'Open settings', macKeys: ['⌘', ','], windowsKeys: ['Ctrl', ','] },
    { id: 'close-file', label: 'Close file', macKeys: ['⌘', 'W'], windowsKeys: ['Ctrl', 'W'] },
    { id: 'save-file', label: 'Save file', macKeys: ['⌘', 'S'], windowsKeys: ['Ctrl', 'S'] },
] as const;

export type AppShortcut = (typeof APP_SHORTCUTS)[number];

export const EMPTY_STATE_SHORTCUT_IDS: Array<AppShortcut['id']> = ['open-file', 'new-file', 'run-analysis'];

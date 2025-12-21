import { OPERATIONAL_KEYS, type ShortcutKey } from '@/lib/app-shortcuts';

function normalizeKey(key: string) {
    return key.length === 1 ? key.toUpperCase() : key;
}

export function matchesShortcut(keys: readonly ShortcutKey[], event: KeyboardEvent) {
    if (keys.length === 0) return false;

    const isCtrlRequired = keys.includes('Ctrl');
    const isShiftRequired = keys.includes('Shift');
    const isAltRequired = keys.includes('Alt');

    const isCtrlPressed = event.ctrlKey || event.metaKey;
    const isShiftPressed = event.shiftKey;
    const isAltPressed = event.altKey;

    if (isCtrlRequired !== isCtrlPressed) return false;
    if (isShiftRequired !== isShiftPressed) return false;
    if (isAltRequired !== isAltPressed) return false;

    const pressedKey = normalizeKey(event.key);
    const nonOperationalKeys = keys.filter(k => !(OPERATIONAL_KEYS as readonly ShortcutKey[]).includes(k));
    return nonOperationalKeys.some(key => normalizeKey(key) === pressedKey);
}

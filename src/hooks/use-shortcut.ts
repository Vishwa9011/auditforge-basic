import { useEffect } from 'react';
import type { ShortcutKey } from '@/lib/app-shortcuts';
import { matchesShortcut } from '@/lib/shortcut-matcher';

/**
 *
 * @param keys combination of keys to listen for example: ['Ctrl', 'P']
 * @param cb callback to be called when the key combination is pressed
 */
export function useShortcut(keys: readonly ShortcutKey[], cb: () => void) {
    if (keys.length > 3) console.error('Only three Key combinations are allowed.');

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.repeat) return;
            if (matchesShortcut(keys, event)) {
                // Prevent default browser behavior
                event.preventDefault();
                event.stopPropagation();
                cb();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keys, cb]);
}

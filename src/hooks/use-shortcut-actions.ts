import { useEffect, useMemo, useRef } from 'react';
import { usePlatform } from '@/hooks/use-platform';
import { matchesShortcut } from '@/lib/shortcut-matcher';
import { APP_SHORTCUTS, type AppShortcutId } from '@/lib/app-shortcuts';

export type ShortcutActions = Partial<Record<AppShortcutId, () => void>>;

export function useShortcutActions(actionsById: ShortcutActions, enabled = true) {
    const platform = usePlatform();
    const allowMetaAsCtrl = platform === 'mac';

    const actionsByIdRef = useRef(actionsById);
    useEffect(() => {
        actionsByIdRef.current = actionsById;
    }, [actionsById]);

    const shortcuts = useMemo(
        () =>
            APP_SHORTCUTS.map(shortcut => ({
                id: shortcut.id,
                keys: shortcut.keys,
            })),
        [],
    );

    useEffect(() => {
        if (!enabled) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.repeat) return;

            for (const shortcut of shortcuts) {
                const action = actionsByIdRef.current[shortcut.id];
                if (!action) continue;
                if (!matchesShortcut(shortcut.keys, event, { allowMetaAsCtrl })) continue;

                event.preventDefault();
                event.stopPropagation();
                action();
                return;
            }
        }

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [enabled, shortcuts]);
}

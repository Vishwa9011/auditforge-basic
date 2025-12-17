import { usePgUiToggle, type UiToggleKey } from '@features/playground/store';
import { useEffect } from 'react';

export function useUiToggle(id: UiToggleKey, defaultEnabled = false) {
    const isEnabled = usePgUiToggle(state => state.isEnabled(id));
    const toggle = usePgUiToggle(state => state.toggle);

    useEffect(() => {
        if (usePgUiToggle.getState().toggleStateById[id] === undefined) {
            toggle(id, defaultEnabled);
        }
    }, [defaultEnabled]);

    return {
        isEnabled,
        toggle: (enabled?: boolean) => toggle(id, enabled),
    };
}

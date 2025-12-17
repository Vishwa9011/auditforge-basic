import { usePgUiToggle, type UiToggleKey } from '@features/playground/store';

export function useUiToggle(id: UiToggleKey) {
    const isEnabled = usePgUiToggle(state => state.isEnabled(id));
    const toggle = usePgUiToggle(state => state.toggle);

    return {
        isEnabled,
        toggle: (enabled?: boolean) => toggle(id, enabled),
    };
}

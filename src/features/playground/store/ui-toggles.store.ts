import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';

export const UI_TOGGLE_KEYS = ['file-explorer-panel', 'analyzer-panel'] as const;
export type UiToggleKey = (typeof UI_TOGGLE_KEYS)[number] | (string & {});

export const DEFAULT_TOGGLE_STATE: Record<UiToggleKey, boolean> = {
    'file-explorer-panel': true,
    'analyzer-panel': false,
};

type PlaygroundUiToggleStore = {
    toggleStateById: Record<string, boolean>;

    isEnabled: (id: string) => boolean;
    toggle: (id: string, enabled?: boolean) => void;
    resetAllToggles: () => void;
};

export const usePgUiToggle = create<PlaygroundUiToggleStore>()(
    persist(
        immer((set, get) => ({
            toggleStateById: DEFAULT_TOGGLE_STATE,

            isEnabled: id => {
                const state = get();
                return state.toggleStateById[id] ?? false;
            },

            toggle: (id, enabled) => {
                set(state => {
                    const current = Boolean(state.toggleStateById[id]);
                    state.toggleStateById[id] = enabled ?? !current;
                });
            },

            resetAllToggles: () => {
                set(state => {
                    state.toggleStateById = DEFAULT_TOGGLE_STATE;
                });
            },
        })),
        {
            name: 'pg-ui-toggles',
            version: 1,
            partialize: state => ({
                toggleStateById: state.toggleStateById,
            }),
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);

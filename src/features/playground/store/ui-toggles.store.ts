import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';

export const UI_TOGGLE_KEYS = ['file-explorer-panel', 'analyzer-panel'] as const;
export type UiToggleKey = (typeof UI_TOGGLE_KEYS)[number] | (string & {});

export const PERSIST_KEYS: UiToggleKey[] = ['file-explorer-panel'] as const;

const DEFAULT_TOGGLE_STATE: Record<UiToggleKey, boolean> = {
    'file-explorer-panel': true,
    'analyzer-panel': true,
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
            toggleStateById: {},

            isEnabled: id => {
                const state = get();
                if (id in state.toggleStateById) return Boolean(state.toggleStateById[id]);
                if (id in DEFAULT_TOGGLE_STATE) return DEFAULT_TOGGLE_STATE[id as UiToggleKey];
                return false;
            },

            toggle: (id, enabled) => {
                set(state => {
                    const current =
                        id in state.toggleStateById
                            ? state.toggleStateById[id]
                            : id in DEFAULT_TOGGLE_STATE
                              ? DEFAULT_TOGGLE_STATE[id as UiToggleKey]
                              : false;
                    state.toggleStateById[id] = enabled ?? !current;
                });
            },

            resetAllToggles: () => {
                set(state => {
                    state.toggleStateById = {};
                });
            },
        })),
        {
            name: 'pg-ui-toggles',
            version: 1,
            partialize: state => {
                const persistedState: Pick<PlaygroundUiToggleStore, 'toggleStateById'> = { toggleStateById: {} };
                for (const key of PERSIST_KEYS) {
                    if (key in state.toggleStateById) {
                        persistedState.toggleStateById[key] = state.toggleStateById[key];
                    }
                }
                return persistedState;
            },
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);

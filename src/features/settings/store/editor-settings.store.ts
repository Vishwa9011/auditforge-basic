import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getEditorFontFamily, type EditorFontFamilyId } from '@/features/playground/editor';

type EditorSettingsState = {
    fontFamily: EditorFontFamilyId;
    fontSize: number;
    lineHeight: number;
    fontLigatures: boolean;
    lineNumbers: boolean;
    wordWrap: boolean;
    minimap: boolean;

    setFontFamily: (fontFamily: EditorFontFamilyId) => void;
    setFontSize: (fontSize: number) => void;
    setLineHeight: (lineHeight: number) => void;
    setFontLigatures: (enabled: boolean) => void;
    setLineNumbers: (enabled: boolean) => void;
    setWordWrap: (enabled: boolean) => void;
    setMinimap: (enabled: boolean) => void;
    reset: () => void;
};

const DEFAULTS: Pick<
    EditorSettingsState,
    'fontFamily' | 'fontSize' | 'lineHeight' | 'fontLigatures' | 'lineNumbers' | 'wordWrap' | 'minimap'
> = {
    fontFamily: getEditorFontFamily().id,
    fontSize: 14,
    lineHeight: 20,
    fontLigatures: true,
    lineNumbers: true,
    wordWrap: true,
    minimap: true,
};

function clampInt(value: number, min: number, max: number): number {
    const n = Number.isFinite(value) ? Math.round(value) : min;
    return Math.max(min, Math.min(max, n));
}

export const useEditorSettings = create<EditorSettingsState>()(
    persist(
        immer(set => ({
            ...DEFAULTS,

            setFontFamily: fontFamily => {
                set(state => {
                    state.fontFamily = fontFamily;
                });
            },

            setFontSize: fontSize => {
                set(state => {
                    state.fontSize = clampInt(fontSize, 12, 24);
                });
            },

            setLineHeight: lineHeight => {
                set(state => {
                    state.lineHeight = clampInt(lineHeight, 16, 32);
                });
            },

            setFontLigatures: enabled => {
                set(state => {
                    state.fontLigatures = enabled;
                });
            },

            setLineNumbers: enabled => {
                set(state => {
                    state.lineNumbers = enabled;
                });
            },

            setWordWrap: enabled => {
                set(state => {
                    state.wordWrap = enabled;
                });
            },

            setMinimap: enabled => {
                set(state => {
                    state.minimap = enabled;
                });
            },

            reset: () => {
                set(state => {
                    state.fontFamily = DEFAULTS.fontFamily;
                    state.fontSize = DEFAULTS.fontSize;
                    state.lineHeight = DEFAULTS.lineHeight;
                    state.fontLigatures = DEFAULTS.fontLigatures;
                    state.lineNumbers = DEFAULTS.lineNumbers;
                    state.wordWrap = DEFAULTS.wordWrap;
                    state.minimap = DEFAULTS.minimap;
                });
            },
        })),
        {
            name: 'editor-settings',
            version: 1,
            storage: createJSONStorage(() => localStorage),
            migrate: persistedState => {
                if (!persistedState || typeof persistedState !== 'object') return persistedState;
                const s = persistedState as Partial<EditorSettingsState>;
                return {
                    ...s,
                    fontSize: clampInt(Number(s.fontSize ?? DEFAULTS.fontSize), 12, 24),
                    lineHeight: clampInt(Number(s.lineHeight ?? DEFAULTS.lineHeight), 16, 32),
                };
            },
        },
    ),
);

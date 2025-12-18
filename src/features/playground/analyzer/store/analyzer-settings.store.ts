import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LlmProvider, ThinkingLevel } from '../llm/config';
import { clampThinkingLevel, getDefaultModel } from '../llm/config';

type AnalyzerSettingsState = {
    provider: LlmProvider;
    modelByProvider: Record<LlmProvider, string>;
    thinkingLevel: ThinkingLevel;

    openaiApiKey: string;
    openaiBaseUrl: string;
    ollamaHost: string;

    setProvider: (provider: LlmProvider) => void;
    setModel: (model: string) => void;
    setThinkingLevel: (level: ThinkingLevel) => void;
    setOpenaiApiKey: (apiKey: string) => void;
    setOpenaiBaseUrl: (baseUrl: string) => void;
    setOllamaHost: (host: string) => void;
    reset: () => void;
};

const DEFAULTS: Pick<
    AnalyzerSettingsState,
    'provider' | 'modelByProvider' | 'thinkingLevel' | 'openaiApiKey' | 'openaiBaseUrl' | 'ollamaHost'
> = {
    provider: 'ollama',
    modelByProvider: {
        ollama: getDefaultModel('ollama'),
        openai: getDefaultModel('openai'),
    },
    thinkingLevel: 'medium',
    openaiApiKey: '',
    openaiBaseUrl: '',
    ollamaHost: 'http://localhost:11434',
};

export const useAnalyzerSettings = create<AnalyzerSettingsState>()(
    persist(
        immer((set, get) => ({
            ...DEFAULTS,

            setProvider: provider => {
                set(state => {
                    state.provider = provider;
                    if (!state.modelByProvider[provider]) state.modelByProvider[provider] = getDefaultModel(provider);
                    state.thinkingLevel = clampThinkingLevel(
                        provider,
                        state.modelByProvider[provider],
                        state.thinkingLevel,
                    );
                });
            },

            setModel: model => {
                const { provider } = get();
                set(state => {
                    state.modelByProvider[provider] = model;
                    state.thinkingLevel = clampThinkingLevel(provider, model, state.thinkingLevel);
                });
            },

            setThinkingLevel: level => {
                const { provider, modelByProvider } = get();
                set(state => {
                    state.thinkingLevel = clampThinkingLevel(provider, modelByProvider[provider], level);
                });
            },

            setOpenaiApiKey: apiKey => {
                set(state => {
                    state.openaiApiKey = apiKey;
                });
            },

            setOpenaiBaseUrl: baseUrl => {
                set(state => {
                    state.openaiBaseUrl = baseUrl;
                });
            },

            setOllamaHost: host => {
                set(state => {
                    state.ollamaHost = host;
                });
            },

            reset: () => {
                set(state => {
                    state.provider = DEFAULTS.provider;
                    state.modelByProvider = DEFAULTS.modelByProvider;
                    state.thinkingLevel = DEFAULTS.thinkingLevel;
                    state.openaiApiKey = DEFAULTS.openaiApiKey;
                    state.openaiBaseUrl = DEFAULTS.openaiBaseUrl;
                    state.ollamaHost = DEFAULTS.ollamaHost;
                });
            },
        })),
        {
            name: 'analyzer-settings',
            version: 1,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

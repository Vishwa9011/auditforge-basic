export const LLM_PROVIDERS = ['ollama', 'openai'] as const;
export type LlmProvider = (typeof LLM_PROVIDERS)[number];

export const THINKING_LEVELS = ['none', 'low', 'medium', 'high'] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

export const MAX_PROMPT_TOKENS_BY_PROVIDER: Record<LlmProvider, number> = {
    ollama: 16_000,
    openai: 32_000,
};

export type ModelSuggestion = {
    id: string;
    label: string;
    provider: LlmProvider;
    selected?: boolean;
    recommended?: boolean;
    allowedThinkingLevels?: ThinkingLevel[];
    defaultThinkingLevel?: ThinkingLevel;
};

export type ModelName<T extends LlmProvider> = (typeof MODEL_SUGGESTIONS)[T][number]['id'];

export const DEFAULT_OLLAMA_HOST = 'http://localhost:11434';
export const DEFAULT_PROVIDER: LlmProvider = 'openai';

export const MODEL_SUGGESTIONS = {
    ollama: [
        {
            id: 'codellama:7b',
            label: 'CodeLlama (7B)',
            provider: 'ollama',
            selected: true,
            recommended: true,
            allowedThinkingLevels: ['none', 'low'],
            defaultThinkingLevel: 'low',
        },
        {
            id: 'deepseek-r1:7b',
            label: 'DeepSeek R1 (7B)',
            provider: 'ollama',
            allowedThinkingLevels: ['low', 'medium', 'high'],
            defaultThinkingLevel: 'medium',
        },
        {
            id: 'llama3.1:8b',
            label: 'Llama 3.1 (8B)',
            provider: 'ollama',
            allowedThinkingLevels: ['none', 'low'],
            defaultThinkingLevel: 'none',
        },
    ],

    openai: [
        {
            id: 'gpt-4o-mini',
            label: 'GPT-4o Mini',
            provider: 'openai',
            selected: true,
            allowedThinkingLevels: ['none', 'low'],
            defaultThinkingLevel: 'low',
        },
        {
            id: 'gpt-4o',
            label: 'GPT-4o',
            provider: 'openai',
            allowedThinkingLevels: ['none', 'low', 'medium'],
            defaultThinkingLevel: 'medium',
        },
        {
            id: 'gpt-4.1',
            label: 'GPT-4.1',
            provider: 'openai',
            allowedThinkingLevels: ['low', 'medium'],
            defaultThinkingLevel: 'medium',
        },
        {
            id: 'gpt-5-mini',
            label: 'GPT-5 Mini',
            provider: 'openai',
            allowedThinkingLevels: ['none', 'low', 'medium'],
            defaultThinkingLevel: 'low',
        },
        {
            id: 'gpt-5',
            label: 'GPT-5',
            provider: 'openai',
            recommended: true,
            allowedThinkingLevels: ['low', 'medium', 'high'],
            defaultThinkingLevel: 'high',
        },
        {
            id: 'gpt-5.2',
            label: 'GPT-5.2',
            provider: 'openai',
            recommended: true,
            allowedThinkingLevels: ['medium', 'high'],
            defaultThinkingLevel: 'high',
        },
    ],
} as const satisfies Record<LlmProvider, readonly ModelSuggestion[]>;

export function getDefaultModelSuggestion(provider: LlmProvider): ModelSuggestion {
    const suggestions = MODEL_SUGGESTIONS[provider] ?? MODEL_SUGGESTIONS[DEFAULT_PROVIDER];
    const selected = suggestions.find(m => 'selected' in m && m.selected);
    const fallback = suggestions[0];
    if (selected) return selected;
    if (fallback) return fallback;
    throw new Error(`No model suggestions configured for provider: ${provider}`);
}

export function getModelSuggestions(provider: LlmProvider): readonly ModelSuggestion[] {
    return MODEL_SUGGESTIONS[provider] ?? [];
}

export function getModelSuggestion(provider: LlmProvider, modelId: string): ModelSuggestion | undefined {
    return MODEL_SUGGESTIONS[provider]?.find(m => m.id === modelId);
}

export function resolveModelId<T extends LlmProvider>(provider: T, modelId: string | null | undefined): ModelName<T> {
    const normalized = modelId?.trim();
    if (normalized && MODEL_SUGGESTIONS[provider].some(m => m.id === normalized)) {
        return normalized as ModelName<T>;
    }
    return getDefaultModelSuggestion(provider).id as ModelName<T>;
}

export function getAllowedThinkingLevels(provider: LlmProvider, modelId: string): ThinkingLevel[] {
    const model = getModelSuggestion(provider, modelId) ?? getDefaultModelSuggestion(provider);
    return model.allowedThinkingLevels ?? [...THINKING_LEVELS];
}

export function clampThinkingLevel(provider: LlmProvider, modelId: string, level: ThinkingLevel): ThinkingLevel {
    const model = getModelSuggestion(provider, modelId) ?? getDefaultModelSuggestion(provider);
    const allowed = model.allowedThinkingLevels ?? [...THINKING_LEVELS];
    if (allowed.length === 0) return level;
    if (allowed.includes(level)) return level;
    return model.defaultThinkingLevel ?? allowed[0];
}

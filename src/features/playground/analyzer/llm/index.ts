import type { AnalyzeRequest, AnalyzeResult } from '../types';
import { analyzeWithOllama } from './providers/ollama';
import { analyzeWithOpenAI } from './providers/openai';
import type { LlmProvider, ThinkingLevel } from './config';

export type LlmRunConfig = {
    provider: LlmProvider;
    model: string;
    thinkingLevel: ThinkingLevel;
    openai?: {
        apiKey?: string;
        baseURL?: string;
    };
    ollama?: {
        host?: string;
    };
};

export async function llm(config: LlmRunConfig, input: AnalyzeRequest): Promise<AnalyzeResult> {
    switch (config.provider) {
        case 'ollama': {
            return await analyzeWithOllama(input, {
                host: config.ollama?.host ?? 'http://localhost:11434',
                model: config.model,
                thinkingLevel: config.thinkingLevel,
            });
        }
        case 'openai': {
            return await analyzeWithOpenAI(input, {
                apiKey: config.openai?.apiKey,
                baseURL: config.openai?.baseURL,
                model: config.model,
                thinkingLevel: config.thinkingLevel,
            });
        }
        default:
            throw new Error(`Unsupported LLM: ${config.provider}`);
    }
}

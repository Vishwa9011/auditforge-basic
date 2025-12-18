import { Ollama } from 'ollama/browser';
import { buildSystemPrompt, buildUserPrompt } from '../prompt';
import type { AnalyzeRequest, AnalyzeResult } from '../../types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from '../schema';
import type { ThinkingLevel } from '../config';

export type OllamaProviderConfig = {
    host: string;
    model: string;
    thinkingLevel: ThinkingLevel;
};

const clientsByHost = new Map<string, Ollama>();
function getOllamaClient(host: string): Ollama {
    const normalizedHost = host.trim().replace(/\/+$/, '');
    const existing = clientsByHost.get(normalizedHost);
    if (existing) return existing;
    const created = new Ollama({ host: normalizedHost });
    clientsByHost.set(normalizedHost, created);
    return created;
}

const NUM_PREDICT_BY_THINKING: Record<ThinkingLevel, number> = {
    low: 1200,
    medium: 2200,
    high: 3400,
};

export const analyzeWithOllama = async (input: AnalyzeRequest, config: OllamaProviderConfig): Promise<AnalyzeResult> => {
    const parsedInput = AnalyzeRequestSchema.safeParse(input);
    if (!parsedInput.success) {
        return { ok: false, error: parsedInput.error };
    }

    const host = config.host.trim() || 'http://localhost:11434';
    const model = config.model.trim();
    if (!model) return { ok: false, error: 'Missing Ollama model name' };

    const systemPrompt = buildSystemPrompt(config.thinkingLevel);
    const prompt = buildUserPrompt(parsedInput.data);

    let response;
    try {
        response = await getOllamaClient(host).chat({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            format: zodToJsonSchema(AnalyzeResponseSchema),
            options: {
                temperature: 0.1,
                num_predict: NUM_PREDICT_BY_THINKING[config.thinkingLevel],
            },
        });
    } catch {
        return { ok: false, error: 'Failed to get response from Ollama model' };
    }

    let json: unknown;
    try {
        json = JSON.parse(response.message.content);
    } catch {
        return { ok: false, error: 'Model did not return valid JSON' };
    }

    const parsedResponse = AnalyzeResponseSchema.safeParse(json);
    if (!parsedResponse.success) {
        return { ok: false, error: 'Model response did not match schema' };
    }

    return { ok: true, data: parsedResponse.data };
};

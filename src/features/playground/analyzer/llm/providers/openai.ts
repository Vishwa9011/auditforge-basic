import OpenAI from 'openai';
import type { AnalyzeRequest, AnalyzeResult } from '../../types';
import { buildSystemPrompt, buildUserPrompt } from '../prompt';
import { zodResponseFormat } from 'openai/helpers/zod';
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from '../schema';
import type { ThinkingLevel } from '../config';

export type OpenAIProviderConfig = {
    apiKey?: string;
    baseURL?: string;
    model: string;
    thinkingLevel: ThinkingLevel;
};

const MAX_TOKENS_BY_THINKING: Record<ThinkingLevel, number> = {
    low: 1200,
    medium: 2200,
    high: 3400,
};

export async function analyzeWithOpenAI(input: AnalyzeRequest, config: OpenAIProviderConfig): Promise<AnalyzeResult> {
    const parsedInput = AnalyzeRequestSchema.safeParse(input);
    if (!parsedInput.success) {
        return { ok: false, error: parsedInput.error };
    }

    const apiKey = config.apiKey || import.meta.env.VITE_OPEN_API_KEY;
    if (!apiKey) {
        return {
            ok: false,
            error: 'Missing OpenAI API key (set it in Analyzer settings or VITE_OPEN_API_KEY)',
        };
    }

    const client = new OpenAI({
        apiKey,
        baseURL: config.baseURL || undefined,
        dangerouslyAllowBrowser: true,
    });

    const systemPrompt = buildSystemPrompt(config.thinkingLevel);
    const prompt = buildUserPrompt(parsedInput.data);

    let output;
    try {
        const response = await client.chat.completions.create({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            temperature: 0.1,
            max_tokens: MAX_TOKENS_BY_THINKING[config.thinkingLevel],
            response_format: zodResponseFormat(AnalyzeResponseSchema, 'analyze_response_schema'),
        });
        output = JSON.parse(response.choices[0].message.content || '');
    } catch (error) {
        return { ok: false, error };
    }

    const parsedOutput = AnalyzeResponseSchema.safeParse(output);
    if (!parsedOutput.success) {
        return { ok: false, error: parsedOutput.error };
    }

    return { ok: true, data: parsedOutput.data };
}

import type z from 'zod/v3';
import type { AnalyzeRequestSchema, AnalyzeResponseSchema } from './llm/schema';

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export type AnalyzeResult =
    | {
          ok: true;
          data: AnalyzeResponse;
      }
    | { ok: false; error: any };

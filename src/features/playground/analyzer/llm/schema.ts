import { z } from 'zod/v3';

const severityLevels = ['low', 'medium', 'high', 'critical'] as const;
const issueCategories = ['security', 'gas', 'logic', 'style'] as const;

export const AnalyzeRequestSchema = z.object({
    language: z.enum(['solidity']),
    scope: z.enum(['file']),
    file: z.object({
        name: z.string(),
        content: z.string(),
    }),
});

const LocationSchema = z.object({
    line: z.number().nullable(),
    function: z.string().nullable(),
});

const IssueSchema = z.object({
    title: z.string(),
    severity: z.enum(severityLevels),
    category: z.enum(issueCategories),
    description: z.string(),
    recommendation: z.string(),
    location: LocationSchema.nullable(),
});

export const AnalyzeResponseSchema = z.object({
    summary: z.string(),
    overview: z.object({
        solidityVersion: z.string(),
        functions: z.number(),
        issuesFound: z.number(),
        issuesBySeverity: z.object({
            low: z.number(),
            medium: z.number(),
            high: z.number(),
            critical: z.number(),
        }),
        issuesByCategory: z.object({
            security: z.number(),
            gas: z.number(),
            logic: z.number(),
            style: z.number(),
        }),
        securityLevel: z.enum(severityLevels),
    }),
    issues: z.array(IssueSchema),
});

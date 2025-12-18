export type ContractSourceFile = {
    path: string;
    content: string;
};

export type ParsedContractSource = {
    files: ContractSourceFile[];
    warnings: string[];
    kind: 'single' | 'multi' | 'empty' | 'unknown';
};

const normalizePath = (rawPath: string) => {
    const cleaned = rawPath.replaceAll('\\', '/').trim();
    const parts = cleaned.split('/').filter(Boolean);
    const safeParts: string[] = [];
    for (const part of parts) {
        if (part === '.' || part === '') continue;
        if (part === '..') {
            safeParts.pop();
            continue;
        }
        safeParts.push(part);
    }
    return safeParts.join('/');
};

const sanitizeFolderName = (rawName: string) => {
    const name = rawName.trim();
    if (!name) return 'contract';
    return name
        .replaceAll(/[^\w.-]+/g, '-')
        .replaceAll(/-+/g, '-')
        .replaceAll(/^-+|-+$/g, '')
        .slice(0, 80);
};

export const sanitizeRelativeDirPath = (rawPath: string) => {
    const cleaned = rawPath.replaceAll('\\', '/').trim();
    const parts = cleaned
        .split('/')
        .map(p => p.trim())
        .filter(Boolean);
    const safe = parts.map(sanitizeFolderName).filter(Boolean);
    return safe.join('/');
};

const guessFallbackFilename = (contractName?: string | null, contractFileName?: string | null) => {
    const preferred = (contractFileName ?? '').trim() || (contractName ?? '').trim();
    if (!preferred) return 'Contract.sol';
    return preferred.toLowerCase().endsWith('.sol') ? preferred : `${preferred}.sol`;
};

export function parseEtherscanSourceCode(params: {
    sourceCode: string | null | undefined;
    contractName?: string | null;
    contractFileName?: string | null;
}): ParsedContractSource {
    const warnings: string[] = [];
    const sourceCode = (params.sourceCode ?? '').trim();
    if (!sourceCode) return { files: [], warnings, kind: 'empty' };

    const fallbackFilename = guessFallbackFilename(params.contractName, params.contractFileName);

    const parseJson = (raw: string) => {
        try {
            return JSON.parse(raw) as unknown;
        } catch {
            return null;
        }
    };

    // Etherscan multi-file contracts often come back wrapped in double braces: `{{ ... }}`
    const maybeJson = sourceCode.startsWith('{') || sourceCode.startsWith('[');
    if (maybeJson) {
        const trimmed = sourceCode;

        const candidates = [trimmed];
        if (trimmed.startsWith('{{') && trimmed.endsWith('}}')) {
            candidates.unshift(trimmed.slice(1, -1));
        }

        for (const candidate of candidates) {
            const value = parseJson(candidate);
            if (value === null) continue;

            if (value && typeof value === 'object' && !Array.isArray(value) && 'sources' in value) {
                const sources = (value as { sources?: unknown }).sources;
                if (sources && typeof sources === 'object' && !Array.isArray(sources)) {
                    const files: ContractSourceFile[] = [];
                    for (const [rawPath, entry] of Object.entries(sources as Record<string, unknown>)) {
                        const normalizedPath = normalizePath(rawPath);
                        if (!normalizedPath) continue;

                        const content =
                            entry && typeof entry === 'object' && !Array.isArray(entry) && 'content' in entry
                                ? String((entry as { content?: unknown }).content ?? '')
                                : String(entry ?? '');

                        files.push({ path: normalizedPath, content });
                    }

                    if (files.length === 0) {
                        warnings.push('Explorer returned a sources object with no files.');
                        break;
                    }

                    return { files, warnings, kind: 'multi' };
                }
            }

            // If we successfully parsed JSON but can't interpret it, fall through to single-file.
            warnings.push('Explorer returned JSON source, but it did not match the expected multi-file format.');
            break;
        }
    }

    // Single-file fallback
    return {
        files: [{ path: normalizePath(fallbackFilename) || 'Contract.sol', content: sourceCode }],
        warnings,
        kind: maybeJson ? 'unknown' : 'single',
    };
}

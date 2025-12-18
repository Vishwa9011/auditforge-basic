import { getFileExtension } from '@/features/playground/store/file-system';
import type { ContractSourceFile, ParsedContractSource } from './source-parser';

export const sortImportFiles = <T extends { path: string }>(files: T[]) => {
    const rank = (path: string) => {
        const ext = getFileExtension(path).toLowerCase();
        if (ext === 'sol') return 0;
        if (ext === 'json') return 1;
        return 2;
    };

    return [...files].sort((a, b) => {
        const r = rank(a.path) - rank(b.path);
        if (r !== 0) return r;
        return a.path.localeCompare(b.path);
    });
};

export const tryPrettifyJson = (raw: string) => {
    try {
        return JSON.stringify(JSON.parse(raw) as unknown, null, 2) + '\n';
    } catch {
        return raw.trimEnd() + '\n';
    }
};

export const buildContractMetaJson = (params: {
    address: string;
    chainId: number;
    contractName?: string;
    compilerVersion?: string;
    optimizationUsed?: string;
    licenseType?: string;
}) => {
    return (
        JSON.stringify(
            {
                address: params.address,
                chainId: params.chainId,
                contractName: params.contractName,
                compilerVersion: params.compilerVersion,
                optimizationUsed: params.optimizationUsed,
                licenseType: params.licenseType,
                fetchedAt: new Date().toISOString(),
            },
            null,
            2,
        ) + '\n'
    );
};

export function buildExplorerImportFiles(params: {
    parsed: ParsedContractSource;
    contractAddress: string;
    chainId: number;
    explorerItem: null | {
        ABI?: string;
        ContractName?: string;
        CompilerVersion?: string;
        OptimizationUsed?: string;
        LicenseType?: string;
    };
    includeAbiJson?: boolean;
    includeMetaJson?: boolean;
}) {
    const files: ContractSourceFile[] = [...params.parsed.files];
    const includeAbiJson = params.includeAbiJson ?? true;
    const includeMetaJson = params.includeMetaJson ?? true;

    if (params.explorerItem) {
        const abi = params.explorerItem.ABI?.trim();
        if (includeAbiJson && abi && abi !== 'Contract source code not verified') {
            files.push({ path: 'abi.json', content: tryPrettifyJson(abi) });
        }

        if (includeMetaJson) {
            files.push({
                path: 'contract.meta.json',
                content: buildContractMetaJson({
                    address: params.contractAddress.trim(),
                    chainId: params.chainId,
                    contractName: params.explorerItem.ContractName,
                    compilerVersion: params.explorerItem.CompilerVersion,
                    optimizationUsed: params.explorerItem.OptimizationUsed,
                    licenseType: params.explorerItem.LicenseType,
                }),
            });
        }
    }

    return sortImportFiles(files);
}

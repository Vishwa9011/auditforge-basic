import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useFetchContract } from './useFetchContract';
import { extractEtherscanContract } from '../utils/etherscan';
import { parseEtherscanSourceCode } from '../utils/source-parser';
import { buildExplorerImportFiles } from '../utils/import-bundle';
import { useImportSettings } from '@features/settings/store/import-settings.store';

const isMaybeEvmAddress = (value: string) => {
    const v = value.trim();
    return v.startsWith('0x') && v.length === 42;
};

export function useExplorerImport() {
    const fetchSourceCode = useFetchContract();

    const [contractAddress, setContractAddress] = useState('');
    const selectedChainId = useImportSettings(state => state.defaultChainId);
    const setSelectedChainId = useImportSettings(state => state.setDefaultChainId);
    const etherscanApiKey = useImportSettings(state => state.etherscanApiKey);
    const includeAbiJson = useImportSettings(state => state.includeAbiJson);
    const includeMetaJson = useImportSettings(state => state.includeMetaJson);
    const hasApiKey = Boolean(etherscanApiKey.trim());

    const extracted = useMemo(() => {
        if (!fetchSourceCode.data) return null;
        return extractEtherscanContract(fetchSourceCode.data);
    }, [fetchSourceCode.data]);

    const statusMessage = useMemo(() => {
        if (!extracted) return null;
        return extracted.ok ? null : extracted.message;
    }, [extracted]);

    const contractNameForDefaults = useMemo(() => {
        return extracted?.ok ? extracted.item.ContractName?.trim() || '' : '';
    }, [extracted]);

    const parsed = useMemo(() => {
        return parseEtherscanSourceCode({
            sourceCode: extracted?.ok ? extracted.item.SourceCode : null,
            contractName: extracted?.ok ? extracted.item.ContractName : null,
            contractFileName: extracted?.ok ? extracted.item.ContractFileName : null,
        });
    }, [extracted]);

    const importFiles = useMemo(() => {
        return buildExplorerImportFiles({
            parsed,
            contractAddress,
            chainId: selectedChainId,
            explorerItem: extracted?.ok ? extracted.item : null,
            includeAbiJson,
            includeMetaJson,
        });
    }, [contractAddress, extracted, includeAbiJson, includeMetaJson, parsed, selectedChainId]);

    const handleFetch = async () => {
        const address = contractAddress.trim();
        if (!isMaybeEvmAddress(address)) {
            toast.error('Enter a valid contract address (0x… 42 chars)');
            return;
        }
        if (!hasApiKey) {
            toast.error('Set your Explorer API key in Settings → Import');
            return;
        }

        await fetchSourceCode.mutateAsync({ address, chainId: selectedChainId, apiKey: etherscanApiKey.trim() });
    };

    return {
        contractAddress,
        setContractAddress,
        selectedChainId,
        setSelectedChainId,
        hasApiKey,

        contractNameForDefaults,
        statusMessage,
        parsed,
        importFiles,

        handleFetch,

        data: fetchSourceCode.data ?? null,
        isFetching: fetchSourceCode.isPending,
        isError: fetchSourceCode.isError,
        error: fetchSourceCode.error,
    };
}

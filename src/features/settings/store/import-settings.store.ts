import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ImportDestinationBase = 'cwd' | 'workspace-root';

type ImportSettingsState = {
    etherscanApiKey: string;
    defaultChainId: number;
    destinationBase: ImportDestinationBase;
    openAfterImport: boolean;
    includeAbiJson: boolean;
    includeMetaJson: boolean;

    setEtherscanApiKey: (value: string) => void;
    setDefaultChainId: (chainId: number) => void;
    setDestinationBase: (base: ImportDestinationBase) => void;
    setOpenAfterImport: (enabled: boolean) => void;
    setIncludeAbiJson: (enabled: boolean) => void;
    setIncludeMetaJson: (enabled: boolean) => void;
    reset: () => void;
};

const DEFAULTS: Pick<
    ImportSettingsState,
    'etherscanApiKey' | 'defaultChainId' | 'destinationBase' | 'openAfterImport' | 'includeAbiJson' | 'includeMetaJson'
> = {
    etherscanApiKey: import.meta.env.VITE_ETHERSCAN_API_KEY || '',
    defaultChainId: 1,
    destinationBase: 'cwd',
    openAfterImport: true,
    includeAbiJson: true,
    includeMetaJson: true,
};

export const useImportSettings = create<ImportSettingsState>()(
    persist(
        immer(set => ({
            ...DEFAULTS,

            setEtherscanApiKey: value => {
                set(state => {
                    state.etherscanApiKey = value;
                });
            },

            setDefaultChainId: chainId => {
                set(state => {
                    state.defaultChainId = Number(chainId) || DEFAULTS.defaultChainId;
                });
            },

            setDestinationBase: base => {
                set(state => {
                    state.destinationBase = base;
                });
            },

            setOpenAfterImport: enabled => {
                set(state => {
                    state.openAfterImport = enabled;
                });
            },

            setIncludeAbiJson: enabled => {
                set(state => {
                    state.includeAbiJson = enabled;
                });
            },

            setIncludeMetaJson: enabled => {
                set(state => {
                    state.includeMetaJson = enabled;
                });
            },

            reset: () => {
                set(state => {
                    state.etherscanApiKey = DEFAULTS.etherscanApiKey;
                    state.defaultChainId = DEFAULTS.defaultChainId;
                    state.destinationBase = DEFAULTS.destinationBase;
                    state.openAfterImport = DEFAULTS.openAfterImport;
                    state.includeAbiJson = DEFAULTS.includeAbiJson;
                    state.includeMetaJson = DEFAULTS.includeMetaJson;
                });
            },
        })),
        {
            name: 'import-settings',
            version: 1,
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

import { useMemo, useState } from 'react';
import { sanitizeRelativeDirPath } from '../utils/source-parser';
import { useImportSettings } from '@features/settings/store/import-settings.store';

export type DestinationBase = 'cwd' | 'workspace-root';

export function useWorkspaceDestination(params: {
    cwd: string;
    selectedWorkspace: string | null;
    contractNameForDefaults: string;
    contractAddress: string;
}) {
    const [destinationFolderDraft, setDestinationFolderDraft] = useState('');
    const [isDestinationCustomized, setIsDestinationCustomized] = useState(false);
    const storedDestinationBase = useImportSettings(state => state.destinationBase);
    const setStoredDestinationBase = useImportSettings(state => state.setDestinationBase);
    const openAfterImport = useImportSettings(state => state.openAfterImport);
    const setOpenAfterImport = useImportSettings(state => state.setOpenAfterImport);

    const workspaceRoot = params.selectedWorkspace ? `/.workspaces/${params.selectedWorkspace}` : null;
    const destinationBase: DestinationBase = workspaceRoot ? storedDestinationBase : 'cwd';
    const setDestinationBase = (base: DestinationBase) => setStoredDestinationBase(base);
    const baseDir = destinationBase === 'workspace-root' ? workspaceRoot : params.cwd;

    const suggestedDestinationFolder = useMemo(() => {
        const base = sanitizeRelativeDirPath(params.contractNameForDefaults || 'contract') || 'contract';
        const addrSuffix = params.contractAddress.trim().startsWith('0x') ? params.contractAddress.trim().slice(2, 8) : '';
        return `contracts/${addrSuffix ? `${base}-${addrSuffix}` : base}`;
    }, [params.contractAddress, params.contractNameForDefaults]);

    const destinationFolder = isDestinationCustomized ? destinationFolderDraft : suggestedDestinationFolder;

    const setDestinationFolder = (nextValue: string) => {
        setDestinationFolderDraft(nextValue);
        setIsDestinationCustomized(nextValue.trim().length > 0);
    };

    const destinationDir = useMemo(() => {
        if (!baseDir) return '';
        const folder = sanitizeRelativeDirPath(destinationFolder);
        if (!folder) return '';
        return `${baseDir}/${folder}`;
    }, [baseDir, destinationFolder]);

    return {
        workspaceRoot,
        destinationBase,
        setDestinationBase,
        destinationFolder,
        setDestinationFolder,
        suggestedDestinationFolder,
        destinationDir,
        openAfterImport,
        setOpenAfterImport,
    };
}

import { toast } from 'sonner';
import { useFileSystem } from '@features/playground/store';
import { importSourcesToWorkspace } from '../utils/workspace-import';
import { useExplorerImport } from './useExplorerImport';
import { useImportPreview } from './useImportPreview';
import { useWorkspaceDestination, type DestinationBase } from './useWorkspaceDestination';

export type { DestinationBase };

export function useContractImportModel() {
    const cwd = useFileSystem(state => state.cwd);
    const selectedWorkspace = useFileSystem(state => state.selectedWorkspace);

    const explorer = useExplorerImport();
    const preview = useImportPreview(explorer.importFiles);
    const destination = useWorkspaceDestination({
        cwd,
        selectedWorkspace,
        contractNameForDefaults: explorer.contractNameForDefaults,
        contractAddress: explorer.contractAddress,
    });

    const canImport =
        explorer.importFiles.length > 0 && Boolean(selectedWorkspace) && Boolean(destination.destinationDir);

    const handleImport = async () => {
        if (!selectedWorkspace) {
            toast.error('Select a workspace first');
            return;
        }
        if (!destination.destinationDir) {
            toast.error('Choose a destination folder name');
            return;
        }

        try {
            const result = await importSourcesToWorkspace({
                files: explorer.importFiles,
                destinationDir: destination.destinationDir,
                openAfterImport: destination.openAfterImport,
            });
            if (!result.ok) {
                toast.error('No source files to import');
                return;
            }

            const suffix = result.skippedCount > 0 ? ` (${result.skippedCount} skipped)` : '';
            toast.success(`Imported ${result.createdCount} file${result.createdCount === 1 ? '' : 's'}${suffix}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Import failed');
        }
    };

    return {
        explorer: {
            contractAddress: explorer.contractAddress,
            setContractAddress: explorer.setContractAddress,
            selectedChainId: explorer.selectedChainId,
            setSelectedChainId: explorer.setSelectedChainId,
            hasApiKey: explorer.hasApiKey,
            handleFetch: explorer.handleFetch,
            statusMessage: explorer.statusMessage,
            data: explorer.data,
            isFetching: explorer.isFetching,
            isError: explorer.isError,
            error: explorer.error,
        },

        preview: {
            parsed: explorer.parsed,
            importFiles: explorer.importFiles,
            activePath: preview.activePath,
            setActivePath: preview.setActivePath,
            activeFile: preview.activeFile,
            activeFileLanguage: preview.activeFileLanguage,
        },

        workspace: {
            cwd,
            selectedWorkspace,
            workspaceRoot: destination.workspaceRoot,
            destinationBase: destination.destinationBase,
            setDestinationBase: destination.setDestinationBase,
            destinationFolder: destination.destinationFolder,
            setDestinationFolder: destination.setDestinationFolder,
            suggestedDestinationFolder: destination.suggestedDestinationFolder,
            destinationDir: destination.destinationDir,
            openAfterImport: destination.openAfterImport,
            setOpenAfterImport: destination.setOpenAfterImport,
            handleImport,
            canImport,
        },
    };
}

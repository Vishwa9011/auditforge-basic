import { FileCode2 } from 'lucide-react';
import { ExplorerImportCard } from './explorer-import-card';
import { ImportPreviewCard } from './import-preview-card';
import { WorkspaceImportCard } from './workspace-import-card';
import { useContractImportModel } from '../hooks/useContractImportModel';

export function ContractImport() {
    const model = useContractImportModel();

    const explorerErrorMessage =
        model.explorer.isError && model.explorer.error
            ? model.explorer.error instanceof Error
                ? model.explorer.error.message
                : 'Failed to fetch contract source'
            : null;

    return (
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 p-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <FileCode2 className="text-muted-foreground size-5" />
                    <h1 className="text-xl font-semibold tracking-tight">Import contract source</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    Fetch verified sources from an explorer and add them to your current workspace.
                </p>
            </div>

            <ExplorerImportCard
                contractAddress={model.explorer.contractAddress}
                onContractAddressChange={model.explorer.setContractAddress}
                selectedChainId={model.explorer.selectedChainId}
                onSelectedChainIdChange={model.explorer.setSelectedChainId}
                hasApiKey={model.explorer.hasApiKey}
                isFetching={model.explorer.isFetching}
                isError={model.explorer.isError}
                errorMessage={explorerErrorMessage}
                statusMessage={model.explorer.statusMessage}
                onFetch={model.explorer.handleFetch}
            />

            <ImportPreviewCard
                isLoading={model.explorer.isFetching}
                explorerData={model.explorer.data}
                warnings={model.preview.parsed.warnings}
                importFiles={model.preview.importFiles}
                activePath={model.preview.activePath}
                onActivePathChange={model.preview.setActivePath}
                activeFile={model.preview.activeFile}
                activeLanguage={model.preview.activeFileLanguage}
                selectedWorkspace={model.workspace.selectedWorkspace}
                cwd={model.workspace.cwd}
            />

            <WorkspaceImportCard
                destinationBase={model.workspace.destinationBase}
                onDestinationBaseChange={model.workspace.setDestinationBase}
                destinationFolder={model.workspace.destinationFolder}
                onDestinationFolderChange={model.workspace.setDestinationFolder}
                suggestedDestinationFolder={model.workspace.suggestedDestinationFolder}
                openAfterImport={model.workspace.openAfterImport}
                onOpenAfterImportChange={model.workspace.setOpenAfterImport}
                workspaceRoot={model.workspace.workspaceRoot}
                destinationDir={model.workspace.destinationDir}
                canImport={model.workspace.canImport}
                onImport={model.workspace.handleImport}
                selectedWorkspace={model.workspace.selectedWorkspace}
            />
        </div>
    );
}

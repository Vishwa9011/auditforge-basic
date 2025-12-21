import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import FileIcon from './file-icon';
import type { FsNode } from '../types';
import { useUiToggle } from '../hooks';
import { useFileSystem } from '../store';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { getFileExtension, isDir, isFile, META_KEY, resolvePath } from '../store/file-system';

const HIGHLIGHT_CLASS_NAME = 'bg-transparent p-0 m-0 text-[#4FC1FF] dark:text-[#4FC1FF] font-medium';

type OpenFileEntry = {
    absolutePath: string;
    relativePath: string;
    fileName: string;
    directory: string;
    extension: string;
};

export function OpenFileCommandDialog() {
    const { isEnabled: isDialogOpen, toggle: setIsDialogOpen } = useUiToggle('open-file-command-dialog');
    const selectedWorkspace = useFileSystem(state => state.selectedWorkspace);
    const fsTree = useFileSystem(state => state.fsTree);
    const openFile = useFileSystem(state => state.openFile);

    const [query, setQuery] = useState('');

    const highlightedChars = useMemo(() => createHighlightCharSet(query), [query]);

    const workspaceRootPath = selectedWorkspace ? `/.workspaces/${selectedWorkspace}` : '/.workspaces';

    const filesInWorkspace = useMemo(() => {
        if (!isDialogOpen) return [];
        return collectFileEntriesUnderPath(workspaceRootPath, fsTree);
    }, [fsTree, isDialogOpen, workspaceRootPath]);

    const handleOpenChange = useCallback(
        (nextOpen: boolean) => {
            setIsDialogOpen(nextOpen);
            setQuery('');
        },
        [setIsDialogOpen],
    );

    const handleFileOpen = useCallback(
        (absolutePath: string) => {
            openFile(absolutePath);
            setIsDialogOpen(false);
            setQuery('');
        },
        [openFile, setIsDialogOpen],
    );

    return (
        <CommandDialog
            open={isDialogOpen}
            onOpenChange={handleOpenChange}
            title="Open File"
            description="Search and open files in the current workspace."
            className="sm:max-w-180"
        >
            <CommandInput
                placeholder={selectedWorkspace ? `Search files in ${selectedWorkspace}…` : 'Search files…'}
                value={query}
                onValueChange={setQuery}
            />

            <CommandList className="max-h-[60vh]">
                <CommandEmpty>No matching files.</CommandEmpty>

                <CommandGroup heading="Files">
                    {filesInWorkspace.map(entry => (
                        <CommandItem
                            key={entry.absolutePath}
                            value={`${entry.fileName} ${entry.relativePath}`}
                            onSelect={() => handleFileOpen(entry.absolutePath)}
                            className="gap-2"
                        >
                            <FileIcon extension={entry.extension} className="size-4" />
                            <span className="min-w-0 flex-1 truncate">
                                {renderHighlightedText(entry.fileName, highlightedChars)}
                            </span>
                            <span className="text-muted-foreground ml-auto min-w-0 truncate pl-3 text-xs">
                                {renderHighlightedText(entry.directory || '.', highlightedChars)}
                            </span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>

            <CommandSeparator />
            <div className="text-muted-foreground flex items-center justify-between gap-3 px-3 py-2 text-xs">
                <span className="flex items-center gap-2">
                    <kbd className="bg-muted text-muted-foreground inline-flex h-5 items-center rounded border px-1.5 font-mono text-[10px]">
                        Enter
                    </kbd>
                    Open
                </span>
                <span className="flex items-center gap-2">
                    <kbd className="bg-muted text-muted-foreground inline-flex h-5 items-center rounded border px-1.5 font-mono text-[10px]">
                        Esc
                    </kbd>
                    Close
                </span>
            </div>
        </CommandDialog>
    );
}

function collectFileEntriesUnderPath(rootPath: string, fsTree: Map<string, FsNode>): OpenFileEntry[] {
    const resolvedRoot = resolvePath(rootPath, fsTree);
    if (resolvedRoot.kind !== 'found') return [];

    const entries: OpenFileEntry[] = [];

    const normalizeRootPrefix = (path: string) => (path === '/' ? '/' : path.endsWith('/') ? path : `${path}/`);

    const toRelativePath = (absolutePath: string) => {
        if (rootPath === '/') return absolutePath.slice(1);
        const rootPrefix = normalizeRootPrefix(rootPath);
        return absolutePath.startsWith(rootPrefix) ? absolutePath.slice(rootPrefix.length) : absolutePath;
    };

    const walk = (node: FsNode, currentPath: string) => {
        for (const [key, value] of node.entries()) {
            if (key === META_KEY) continue;
            if (typeof key !== 'string') continue;

            const absolutePath = currentPath === '' ? `/${key}` : `${currentPath}/${key}`;

            if (isFile(value)) {
                const relativePath = toRelativePath(absolutePath);
                const lastSlashIndex = relativePath.lastIndexOf('/');
                const directory = lastSlashIndex === -1 ? '' : relativePath.slice(0, lastSlashIndex);

                entries.push({
                    absolutePath,
                    relativePath,
                    fileName: key,
                    directory,
                    extension: getFileExtension(absolutePath),
                });
                continue;
            }

            if (value instanceof Map && isDir(value)) {
                walk(value as FsNode, absolutePath);
            }
        }
    };

    walk(resolvedRoot.node, rootPath === '/' ? '' : rootPath);

    entries.sort((a, b) => a.fileName.localeCompare(b.fileName) || a.directory.localeCompare(b.directory));
    return entries;
}

function createHighlightCharSet(query: string): Set<string> | null {
    const normalized = query.toLowerCase().replace(/\s+/g, '');
    if (normalized.length === 0) return null;
    return new Set(normalized);
}

function renderHighlightedText(text: string, highlightedChars: Set<string> | null) {
    if (!highlightedChars) return text;

    const out: Array<string | ReactNode> = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const shouldHighlight = highlightedChars.has(char.toLowerCase());

        out.push(
            shouldHighlight ? (
                <span key={i} className={HIGHLIGHT_CLASS_NAME}>
                    {char}
                </span>
            ) : (
                char
            ),
        );
    }

    return <>{out}</>;
}

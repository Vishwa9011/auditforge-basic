import { useEffect, useMemo } from 'react';
import { APP_SHORTCUTS, type AppShortcut } from '@/lib/app-shortcuts';
import { matchesShortcut } from '@/lib/shortcut-matcher';
import { useUiToggle } from '@features/playground/hooks';
import { useFileSystem } from '@features/playground/store';
import { useNavigate } from '@tanstack/react-router';

/**
 * A hook to manage keyboard shortcuts within the application.
 * This hook sets up event listeners for keydown events and triggers
 * corresponding actions based on predefined shortcuts.
 *
 * @returns void
 */
export function useShortcuts() {
    const { toggle: toggleOpenFile } = useUiToggle('open-file-command-dialog');
    const { toggle: toggleFileExplorer } = useUiToggle('file-explorer-panel');
    const { toggle: toggleAiAnalysis } = useUiToggle('ai-analysis-panel');
    const navigate = useNavigate();

    const actionsById = useMemo<Partial<Record<AppShortcut['id'], () => void>>>(
        () => ({
            'open-file': () => toggleOpenFile(true),
            'open-file-explorer': () => toggleFileExplorer(),
            'open-ai-analysis': () => toggleAiAnalysis(),
            'open-settings': () => navigate({ to: '/settings' }),
            'close-file': () => {
                const { activeFile, closeFile } = useFileSystem.getState();
                if (!activeFile) return;
                closeFile(activeFile);
            },
        }),
        [navigate, toggleAiAnalysis, toggleFileExplorer, toggleOpenFile],
    );

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.repeat) return;

            for (const shortcut of APP_SHORTCUTS) {
                const action = actionsById[shortcut.id];
                if (!action) continue;
                if (!matchesShortcut(shortcut.windowsKeys, event)) continue;

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                action();
                return;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [actionsById]);
}

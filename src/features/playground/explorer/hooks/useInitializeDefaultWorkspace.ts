import { useEffect, useRef, useState } from 'react';
import { useFileSystem } from '../../store';
import { createFileWithContent } from '../../lib';
import { DEFAULT_CWD, DEFAULT_WORKSPACE, resolvePath, WELCOME_FILE_CONTENT } from '../../store/file-system';

/**
 * Initializes the default workspace if it doesn't exist.
 * Waits for persisted state hydration to avoid clobbering user data.
 */
export function useInitializeDefaultWorkspace() {
    const isWorkspaceInitialized = useFileSystem(state => state.isWorkspaceInitialized);
    const [hasHydrated, setHasHydrated] = useState(() => useFileSystem.persist.hasHydrated());
    const initStartedRef = useRef(false);

    useEffect(() => {
        setHasHydrated(useFileSystem.persist.hasHydrated());
        return useFileSystem.persist.onFinishHydration(() => setHasHydrated(true));
    }, []);

    useEffect(() => {
        if (!hasHydrated) return;
        if (isWorkspaceInitialized) return;
        if (initStartedRef.current) return; // Prevent double initialization
        initStartedRef.current = true;

        const welcomePath = `${DEFAULT_CWD}/welcome.txt`;

        (async () => {
            try {
                const before = resolvePath(DEFAULT_CWD, useFileSystem.getState().fsTree);
                if (before.kind === 'found') {
                    const { openFile, selectWorkspace } = useFileSystem.getState();

                    const afterDirs = useFileSystem.getState().fsTree;
                    const welcomeResult = resolvePath(welcomePath, afterDirs);
                    if (welcomeResult.kind === 'missing') {
                        await createFileWithContent(welcomePath, WELCOME_FILE_CONTENT);
                    }

                    selectWorkspace(DEFAULT_WORKSPACE);
                    openFile(welcomePath);
                }
            } finally {
                useFileSystem.getState().setWorkspaceInitialized(true);
            }
        })();
    }, [hasHydrated, isWorkspaceInitialized]);

    return { isLoading: !hasHydrated || !isWorkspaceInitialized };
}

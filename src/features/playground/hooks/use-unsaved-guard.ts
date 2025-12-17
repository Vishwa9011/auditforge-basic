import { useFileEditorStore } from '@features/playground/store';
import { usePreventUnload } from './use-prevent-unload';

export function useUnsavedGuard() {
    const unsavedInos = useFileEditorStore(state => state.unsavedInos);

    const hasUnsavedChanges = unsavedInos.size > 0;

    usePreventUnload(hasUnsavedChanges);
}

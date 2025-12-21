import Editor, { type Monaco } from '@monaco-editor/react';
import type { InodeMeta } from '@features/playground/types';
import { useEffect, useMemo, useRef } from 'react';
import { useFileEditorStore } from '@features/playground/store';
import { useDebouncedCallback } from 'use-debounce';
import type { editor } from 'monaco-editor';
import { configureMonaco, DEFAULT_EDITOR_OPTIONS, getEditorLanguage, getFontFamilyCssVar } from '../editor-config';
import { useEditorSettings } from '@features/settings/store/editor-settings.store';

type CodeEditorProps = {
    content?: string | null;
    meta?: InodeMeta | null;
    path: string;
    extension?: string;
};

export function CodeEditor({ path, content, meta, extension }: CodeEditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const { fontFamily, fontSize, lineHeight, fontLigatures, lineNumbers, wordWrap, minimap } = useEditorSettings();
    const modelPath = useMemo(() => {
        // Monaco's TS/JS worker decides "script kind" from the model URI (e.g. *.ts vs *.js).
        // Ensure the model has a filename-like URI so TS syntax (e.g. `type`) is accepted.
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `file://${normalizedPath}`;
    }, [path]);

    const unsavedInos = useFileEditorStore(state => state.unsavedInos);
    const markUnsaved = useFileEditorStore(state => state.markUnsaved);
    const draftsByIno = useFileEditorStore(state => state.draftsByIno);
    const upsertDraftContent = useFileEditorStore(state => state.upsertDraftContent);
    const debouncedUpsertDraftContent = useDebouncedCallback(upsertDraftContent, 100);

    function handleEditorChange(value?: string) {
        if (meta && value !== undefined) {
            debouncedUpsertDraftContent(meta.ino, value, path);
            const baselineContent = content ?? '';
            if (value === baselineContent) {
                if (unsavedInos.has(meta.ino)) useFileEditorStore.getState().clearUnsaved(meta.ino);
                return;
            }
            if (!unsavedInos.has(meta.ino)) markUnsaved(meta.ino);
        }
    }

    function handleEditorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Focus the editor when mounted
        editor.focus();
        editor.updateOptions(effectiveEditorOptions);
        updateEditorLanguage();
    }

    const effectiveEditorOptions: editor.IStandaloneEditorConstructionOptions = useMemo(
        () => ({
            ...DEFAULT_EDITOR_OPTIONS,
            fontFamily: getFontFamilyCssVar(fontFamily),
            fontSize,
            lineHeight,
            fontLigatures,
            lineNumbers: lineNumbers ? 'on' : 'off',
            wordWrap: wordWrap ? 'on' : 'off',
            minimap: {
                ...(DEFAULT_EDITOR_OPTIONS.minimap ?? {}),
                enabled: minimap,
            },
            // Enable inline suggestions but with specific settings to prevent conflicts
            inlineSuggest: {
                enabled: true,
                mode: 'prefix',
                suppressSuggestions: false,
            },
            // Disable some conflicting suggest features
            suggest: {
                preview: false, // Disable preview to avoid conflicts
                showInlineDetails: false,
                insertMode: 'replace',
            },
            // Quick suggestions
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true,
            },
            // Smooth cursor
            cursorSmoothCaretAnimation: 'on',
        }),
        [fontFamily, fontSize, lineHeight, fontLigatures, lineNumbers, wordWrap, minimap],
    );

    function updateEditorLanguage() {
        if (!editorRef.current || monacoRef.current == null) return;
        const model = editorRef.current.getModel();

        if (!model) return;
        const language = getEditorLanguage(extension);
        try {
            monacoRef.current.editor.setModelLanguage(model, language);
        } catch (error) {
            console.error('Error setting model language:', error);
        }
    }

    useEffect(() => {
        updateEditorLanguage();
    }, [path, extension]);

    useEffect(() => {
        if (!editorRef.current) return;
        editorRef.current.updateOptions(effectiveEditorOptions);
    }, [effectiveEditorOptions]);

    const draftContent = useMemo(() => {
        if (!meta) return null;
        if (!draftsByIno.has(meta.ino)) return null;
        return draftsByIno.get(meta.ino)?.content;
    }, [draftsByIno, meta]);

    useEffect(() => {
        const upsertDraftContent = useFileEditorStore.getState().upsertDraftContent;
        if (meta && content !== undefined && content !== null) {
            if (draftContent == null) {
                upsertDraftContent(meta.ino, content, path);
            }
        }
    }, [content, meta, draftContent, path]);

    return (
        <div className="border-border h-full w-full border-2" style={{ fontFamily: getFontFamilyCssVar(fontFamily) }}>
            <Editor
                height="100%"
                theme="vs-dark"
                path={modelPath}
                value={draftContent ?? ''}
                onChange={handleEditorChange}
                beforeMount={configureMonaco}
                onMount={handleEditorDidMount}
                options={effectiveEditorOptions}
                language={getEditorLanguage(extension)}
            />
        </div>
    );
}

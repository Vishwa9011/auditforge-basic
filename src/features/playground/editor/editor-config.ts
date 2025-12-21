import type { editor } from 'monaco-editor';
import { type Monaco } from '@monaco-editor/react';

export const getEditorLanguage = (fileExtension?: string): string => {
    if (!fileExtension) return 'plaintext';
    const extension = fileExtension.toLowerCase();
    const languageMap: Record<string, string> = {
        // JavaScript/TypeScript
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        mjs: 'javascript',
        cjs: 'javascript',

        // Web languages
        json: 'json',
        html: 'html',
        htm: 'html',
        css: 'css',
        scss: 'scss',
        sass: 'scss',
        less: 'less',

        // Markup/Documentation
        md: 'markdown',
        markdown: 'markdown',
        xml: 'xml',
        yaml: 'yaml',
        yml: 'yaml',

        // Programming languages
        py: 'python',
        python: 'python',
        java: 'java',
        c: 'c',
        cpp: 'cpp',
        cs: 'csharp',
        php: 'php',
        rb: 'ruby',
        go: 'go',
        rs: 'rust',
        sh: 'shell',
        bash: 'shell',
        sql: 'sql',
        // Monaco's built-in Solidity language id is "sol" (not "solidity").
        sol: 'sol',

        // Config files
        toml: 'ini',
        ini: 'ini',
        conf: 'ini',
        env: 'ini',
        dockerfile: 'dockerfile',
    };

    return languageMap[extension] || 'plaintext';
};

let hasConfiguredMonaco = false;
export const configureMonaco = (monaco: Monaco) => {
    if (hasConfiguredMonaco) return;
    hasConfiguredMonaco = true;

    // Configure additional editor settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    });

    // Set compiler options for better IntelliSense
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
    });
};

export const DEFAULT_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
    // Font settings
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    fontLigatures: true,
    fontWeight: '400',

    // Layout
    minimap: {
        autohide: 'mouseover',
        enabled: true,
        size: 'fit',
        showSlider: 'mouseover',
    },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    // padding: { top: 16, bottom: 16 },

    // Line settings
    lineNumbers: 'on',
    lineHeight: 20,
    renderLineHighlight: 'all',
    renderWhitespace: 'selection',

    // Indentation
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,

    // Word wrapping
    wordWrap: 'on',
    wordWrapColumn: 120,
    wrappingIndent: 'indent',

    // Code folding
    folding: true,
    foldingHighlight: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'mouseover',

    // Scrolling
    smoothScrolling: true,
    mouseWheelZoom: true,
    fastScrollSensitivity: 5,

    // Selection
    multiCursorModifier: 'ctrlCmd',
    selectionHighlight: true,
    occurrencesHighlight: 'singleFile',

    // Suggestions
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    tabCompletion: 'on',
    wordBasedSuggestions: 'allDocuments',
    quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
    },

    // Formatting
    formatOnPaste: true,
    formatOnType: true,

    // Bracket matching
    matchBrackets: 'always',
    bracketPairColorization: {
        enabled: true,
    },

    // Guides
    guides: {
        indentation: true,
        highlightActiveIndentation: true,
    },

    // Performance
    disableLayerHinting: false,
    disableMonospaceOptimizations: false,

    // Accessibility
    accessibilitySupport: 'auto',

    // Cursor
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    cursorStyle: 'line',
    cursorWidth: 2,

    // Find
    find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: 'never',
        seedSearchStringFromSelection: 'always',
    },

    // Hover
    hover: {
        enabled: true,
        delay: 300,
        sticky: true,
    },

    // Semantic highlighting
    'semanticHighlighting.enabled': true,

    // Sticky scroll
    stickyScroll: {
        enabled: true,
    },
};

export const EDITOR_FONT_FAMILY_IDS = {
    JETBRAINS_MONO: 'jetbrains-mono',
    FIRA_CODE: 'fira-code',
    SOURCE_CODE_PRO: 'source-code-pro',
} as const;

export type EditorFontFamilyId = (typeof EDITOR_FONT_FAMILY_IDS)[keyof typeof EDITOR_FONT_FAMILY_IDS];
type EditorFontFamilyDefinition = {
    label: string;
    cssVar: string;
};
type FontFamily = {
    id: EditorFontFamilyId;
} & EditorFontFamilyDefinition;

export const EDITOR_FONT_FAMILY_BY_ID = {
    [EDITOR_FONT_FAMILY_IDS.JETBRAINS_MONO]: {
        label: 'JetBrains Mono',
        cssVar: 'var(--font-jetbrains-mono)',
    },
    [EDITOR_FONT_FAMILY_IDS.FIRA_CODE]: {
        label: 'Fira Code',
        cssVar: 'var(--font-fira-code)',
    },
    [EDITOR_FONT_FAMILY_IDS.SOURCE_CODE_PRO]: {
        label: 'Source Code Pro',
        cssVar: 'var(--font-source-code-pro)',
    },
} as const satisfies Record<EditorFontFamilyId, EditorFontFamilyDefinition>;

export const FONT_FAMILIES = Object.entries(EDITOR_FONT_FAMILY_BY_ID).map(([id, definition]) => ({
    id,
    ...definition,
})) as FontFamily[];

export const getFontFamilyCssVar = (fontId: EditorFontFamilyId) => {
    return EDITOR_FONT_FAMILY_BY_ID[fontId].cssVar;
};

export const getEditorFontFamily = (id?: EditorFontFamilyId) => {
    return FONT_FAMILIES.find(font => font.id === id) ?? FONT_FAMILIES[0];
};

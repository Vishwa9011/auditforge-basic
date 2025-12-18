import Editor from '@monaco-editor/react';
import { configureMonaco, DEFAULT_EDITOR_OPTIONS } from '@features/playground/editor/editor-config';

type CodePanelProps = {
    title: string;
    filename?: string | null;
    value: string;
    language: string;
    height: number;
    readOnly?: boolean;
    onChange?: (nextValue: string) => void;
};

export function CodePanel({
    title,
    filename,
    value,
    language,
    height,
    readOnly = true,
    onChange,
}: CodePanelProps) {
    return (
        <div className="border-border overflow-hidden rounded-lg border">
            <div className="bg-muted/40 border-border flex items-center justify-between border-b px-3 py-2">
                <div className="text-muted-foreground text-xs font-medium">{title}</div>
                <div className="text-muted-foreground text-xs">{filename ?? ''}</div>
            </div>
            <div style={{ height }}>
                <Editor
                    height="100%"
                    theme="vs-dark"
                    beforeMount={configureMonaco}
                    value={value}
                    onChange={readOnly ? undefined : v => onChange?.(v ?? '')}
                    options={{
                        ...DEFAULT_EDITOR_OPTIONS,
                        readOnly,
                        minimap: { ...(DEFAULT_EDITOR_OPTIONS.minimap ?? {}), enabled: false },
                    }}
                    language={language}
                />
            </div>
        </div>
    );
}


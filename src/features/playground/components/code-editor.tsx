import Editor from '@monaco-editor/react';

type CodeEditorProps = {};

export function CodeEditor({}: CodeEditorProps) {
    function handleEditorValidation(markers: any) {
        markers.forEach((marker: any) => console.log('onValidate:', marker.message));
    }

    function handleEditorChange(value: string | undefined) {
        console.log('onChange:', value);
    }

    return (
        <div className="h-full w-full border-2 border-black">
            <Editor
                height="100%"
                theme="vs-dark"
                defaultLanguage="javascript"
                defaultValue="// let's write some broken code 😈"
                onValidate={handleEditorValidation}
                onChange={handleEditorChange}
            />
        </div>
    );
}

export function EmptyEditorState() {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground flex flex-col items-center gap-3">
                <svg
                    className="h-20 w-20 opacity-10"
                    viewBox="0 0 64 64"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8h18l10 10v30a4 4 0 0 1-4 4H18a4 4 0 0 1 4-4V12a4 4 0 0 1 4-4z" />
                    <path d="M36 8v10h10" />
                    <path d="M30 26v14" />
                </svg>

                <p className="text-sm">No file is open</p>

                <div className="text-muted-foreground/60 mt-2 flex gap-4 text-xs">
                    <span>⌘P Open file</span>
                    <span>⌘N New file</span>
                </div>
            </div>
        </div>
    );
}

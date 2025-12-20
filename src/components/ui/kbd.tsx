import * as React from 'react';

import { cn } from '@/lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
    return (
        <kbd
            data-slot="kbd"
            className={cn(
                'bg-muted text-muted-foreground inline-flex h-6 items-center justify-center rounded-md border px-2 font-mono text-xs leading-none font-medium shadow-sm',
                className,
            )}
            {...props}
        />
    );
}

export { Kbd };

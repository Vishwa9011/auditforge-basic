import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TreeItemActionBarProps = {
    children: ReactNode;
    isHidden: boolean;
};

export function TreeItemActionBar({ children, isHidden }: TreeItemActionBarProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-end gap-1 opacity-0 transition-opacity',
                'pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100',
                isHidden && '!hidden',
            )}
        >
            {children}
        </div>
    );
}

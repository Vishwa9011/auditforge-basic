import { cn } from '@/lib/utils';
import { navLinks } from '@/constants';
import { Settings } from 'lucide-react';
import { useUiToggle } from '@features/playground/hooks';
import { Link, useRouterState } from '@tanstack/react-router';

export default function ActivityBar() {
    const location = useRouterState().location;
    const toggle = useUiToggle('file-explorer-panel').toggle;

    const handleFileExplorerClick = () => {
        if (location.pathname !== '/') {
            toggle(true);
        } else {
            toggle();
        }
    };

    return (
        <aside className="border-sidebar-border bg-sidebar text-sidebar-foreground z-50 flex h-full w-12 shrink-0 flex-col border-r">
            <nav aria-label="Primary" className="flex flex-1 flex-col items-center gap-1 px-1 py-2">
                <ul className="flex w-full flex-col items-center gap-1">
                    {navLinks.map(item => (
                        <li key={item.id} className="w-full">
                            <Link
                                onClick={() => item.id === 'file-explorer' && handleFileExplorerClick()}
                                to={item.url}
                                activeOptions={{ exact: item.url === '/' }}
                                activeProps={() => ({ 'data-active': 'true' })}
                                inactiveProps={() => ({ 'data-active': 'false' })}
                                aria-label={item.title}
                                title={item.title}
                                className={cn(
                                    'text-muted-foreground relative mx-auto flex h-10 w-10 items-center justify-center rounded-md transition-colors',
                                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    'focus-visible:ring-ring focus-visible:ring-offset-sidebar focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                                    'before:bg-sidebar-primary before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:opacity-0 before:transition-opacity',
                                    'data-[active=true]:bg-sidebar-accent/80 data-[active=true]:text-sidebar-accent-foreground data-[active=true]:before:opacity-100',
                                )}
                            >
                                <item.icon className="size-5" />
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="mt-auto mb-2">
                    <Link
                        to="/settings"
                        aria-label="Settings"
                        title="Settings"
                        className={cn(
                            'text-muted-foreground relative mx-auto flex h-10 w-10 items-center justify-center rounded-md transition-colors',
                            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            'focus-visible:ring-ring focus-visible:ring-offset-sidebar focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                            'before:bg-sidebar-primary before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:opacity-0 before:transition-opacity',
                            'data-[active=true]:bg-sidebar-accent/80 data-[active=true]:text-sidebar-accent-foreground data-[active=true]:before:opacity-100',
                        )}
                    >
                        <Settings className="size-5" />
                    </Link>
                </div>
            </nav>
        </aside>
    );
}

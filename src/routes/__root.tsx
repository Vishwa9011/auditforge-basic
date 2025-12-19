import ActivityBar from '@/layout/activity-bar';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
    component: () => (
        <div className="flex h-dvh w-full overflow-hidden">
            <ActivityBar />
            <div className="min-h-0 min-w-0 flex-1">
                <Outlet />
            </div>
            <TanStackRouterDevtools />
        </div>
    ),
});

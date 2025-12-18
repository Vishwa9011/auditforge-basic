import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod/v3';
import { SettingsPage } from '@features/settings';

export const Route = createFileRoute('/settings')({
    validateSearch: z
        .object({
            tab: z.enum(['editor', 'analyzer']).optional(),
        })
        .optional(),
    component: RouteComponent,
});

function RouteComponent() {
    const search = Route.useSearch();
    return <SettingsPage initialTab={search?.tab} />;
}

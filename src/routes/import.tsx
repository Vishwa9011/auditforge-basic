import { createFileRoute } from '@tanstack/react-router';
import { ContractImport } from '@/features/contract-import/components';

export const Route = createFileRoute('/import')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="h-full w-full overflow-auto">
            <ContractImport />
        </div>
    );
}

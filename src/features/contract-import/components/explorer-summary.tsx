import type { EtherscanResponse } from '../api';
import { extractEtherscanContract } from '../utils/etherscan';

export function ExplorerSummary({ data }: { data: EtherscanResponse }) {
    const result = extractEtherscanContract(data);

    if (!result.ok) {
        return (
            <div className="rounded-md border px-3 py-2">
                <div className="text-sm font-medium">Explorer response</div>
                <div className="text-muted-foreground mt-1 text-sm">{result.message}</div>
            </div>
        );
    }

    const item = result.item;
    return (
        <div className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
            <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Contract</div>
                <div className="text-sm font-medium">{item.ContractName || 'Unknown'}</div>
                <div className="text-muted-foreground mt-1 text-xs">{item.ContractFileName || '—'}</div>
            </div>
            <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Compiler</div>
                <div className="text-sm font-medium">{item.CompilerVersion || '—'}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                    Optimization: {item.OptimizationUsed === '1' ? 'Enabled' : 'Disabled'}
                    {item.Runs ? ` (runs: ${item.Runs})` : ''}
                </div>
            </div>
            <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">License</div>
                <div className="text-sm font-medium">{item.LicenseType || '—'}</div>
            </div>
            <div>
                <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Proxy</div>
                <div className="text-sm font-medium">{item.Proxy === '1' ? 'Yes' : 'No'}</div>
                {item.Proxy === '1' && item.Implementation ? (
                    <div className="text-muted-foreground mt-1 text-xs">Implementation: {item.Implementation}</div>
                ) : null}
            </div>
        </div>
    );
}


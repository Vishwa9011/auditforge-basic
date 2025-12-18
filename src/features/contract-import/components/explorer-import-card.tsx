import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { chainConfig } from '../constants';

type ExplorerImportCardProps = {
    contractAddress: string;
    onContractAddressChange: (value: string) => void;
    selectedChainId: number;
    onSelectedChainIdChange: (chainId: number) => void;
    hasApiKey: boolean;
    isFetching: boolean;
    isError: boolean;
    errorMessage: string | null;
    statusMessage: string | null;
    onFetch: () => void;
};

export function ExplorerImportCard({
    contractAddress,
    onContractAddressChange,
    selectedChainId,
    onSelectedChainIdChange,
    hasApiKey,
    isFetching,
    isError,
    errorMessage,
    statusMessage,
    onFetch,
}: ExplorerImportCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Fetch from explorer</CardTitle>
                <CardDescription>Use the contract address to fetch verified sources.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-12">
                <div className="space-y-2 md:col-span-6">
                    <Label htmlFor="contract-address">Contract address</Label>
                    <Input
                        id="contract-address"
                        placeholder="0x…"
                        value={contractAddress}
                        onChange={e => onContractAddressChange(e.target.value)}
                    />
                </div>

                <div className="space-y-2 md:col-span-3">
                    <Label>Chain</Label>
                    <Select value={String(selectedChainId)} onValueChange={v => onSelectedChainIdChange(Number(v))}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select chain" />
                        </SelectTrigger>
                        <SelectContent>
                            {chainConfig.map(chain => (
                                <SelectItem key={chain.chainId} value={String(chain.chainId)}>
                                    {chain.name} ({chain.chainId})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-12">
                    {!hasApiKey ? (
                        <div className="text-muted-foreground mb-2 text-sm">
                            Set your Explorer API key in{' '}
                            <Link to="/settings" search={{ tab: 'import' }} className="text-foreground underline">
                                Settings → Import
                            </Link>
                            .
                        </div>
                    ) : null}

                    <Button type="button" className="gap-2" onClick={onFetch} disabled={isFetching || !hasApiKey}>
                        {isFetching ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Fetching…
                            </>
                        ) : (
                            'Fetch source code'
                        )}
                    </Button>

                    {isError && errorMessage ? <div className="text-destructive mt-2 text-sm">{errorMessage}</div> : null}
                    {statusMessage ? <div className="text-destructive mt-2 text-sm">{statusMessage}</div> : null}
                </div>
            </CardContent>
        </Card>
    );
}

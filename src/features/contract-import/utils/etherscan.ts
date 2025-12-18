import type { EtherscanResponse } from '../api';

export function extractEtherscanContract(data: EtherscanResponse) {
    if (data.status !== '1') {
        return { ok: false as const, message: typeof data.result === 'string' ? data.result : data.message };
    }

    if (!Array.isArray(data.result) || data.result.length === 0) {
        return { ok: false as const, message: 'No contract data returned.' };
    }

    return { ok: true as const, item: data.result[0] };
}

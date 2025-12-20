import * as React from 'react';

export type Platform = 'mac' | 'windows' | 'linux' | 'unknown';

function detectPlatform(): Platform {
    if (typeof navigator === 'undefined') return 'unknown';

    const uaDataPlatform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform;
    const platform = navigator.platform;
    const userAgent = navigator.userAgent;

    const haystack = `${uaDataPlatform ?? ''} ${platform ?? ''} ${userAgent ?? ''}`.toLowerCase();

    if (haystack.includes('mac')) return 'mac';
    if (haystack.includes('win')) return 'windows';
    if (haystack.includes('linux') || haystack.includes('x11')) return 'linux';

    return 'unknown';
}

export function usePlatform(): Platform {
    const [platform, setPlatform] = React.useState<Platform>(() => detectPlatform());

    React.useEffect(() => {
        setPlatform(detectPlatform());
    }, []);

    return platform;
}

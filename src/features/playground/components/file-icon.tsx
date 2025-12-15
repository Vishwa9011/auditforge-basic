import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';

import defaultIconUrl from '../../../assets/icons/code.svg';

const iconModules = {
    ...import.meta.glob('../../../assets/icons/*.svg', { eager: true, import: 'default' }),
} as Record<string, string>;

console.log('iconModules: ', iconModules);
const iconsByKey = Object.entries(iconModules).reduce<Record<string, string>>((acc, [path, url]) => {
    const match = /\/([^/]+)\.svg$/i.exec(path);
    if (!match) return acc;
    acc[match[1].toLowerCase()] = url;
    return acc;
}, {});

console.log('iconsByKey: ', iconsByKey);

const extensionAliases: Record<string, string> = {
    jsx: 'js',
    mjs: 'js',
    cjs: 'js',
    tsx: 'ts',
    mts: 'ts',
    cts: 'ts',
    sol: 'sol',
};

function normalizeExtension(extension?: string | null) {
    if (!extension) return null;
    const normalized = extension.trim().toLowerCase().replace(/^\./, '');
    return normalized.length === 0 ? null : normalized;
}

function resolveIconUrl(extension?: string | null) {
    const normalized = normalizeExtension(extension);
    if (!normalized) return defaultIconUrl;
    return iconsByKey[normalized] ?? iconsByKey[extensionAliases[normalized]] ?? defaultIconUrl;
}

export type FileIconProps = {
    extension?: string | null;
    mode?: 'img' | 'mask';
    size?: number | string;
    className?: string;
    imgClassName?: string;
    title?: string;
    alt?: string;
};

export function FileIcon({ extension, mode = 'img', size, className, imgClassName, title, alt }: FileIconProps) {
    const src = resolveIconUrl(extension);
    const isDecorative = alt === undefined && title === undefined;
    const computedAlt = isDecorative ? '' : (alt ?? title ?? (extension ? `${extension} file` : 'file'));
    const sizeStyle = size === undefined ? undefined : { width: size, height: size };

    const supportsMask = (() => {
        try {
            return (
                typeof CSS !== 'undefined' &&
                typeof CSS.supports === 'function' &&
                (CSS.supports('mask-image', 'url(\"\")') || CSS.supports('-webkit-mask-image', 'url(\"\")'))
            );
        } catch {
            return false;
        }
    })();

    const renderMode = mode === 'mask' && supportsMask ? 'mask' : 'img';

    if (renderMode === 'mask') {
        const maskUrl = `url("${src}")`;
        const maskStyle = {
            ...sizeStyle,
            WebkitMask: `${maskUrl} center / contain no-repeat`,
            mask: `${maskUrl} center / contain no-repeat`,
            WebkitMaskImage: maskUrl,
            maskImage: maskUrl,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskMode: 'alpha',
            maskMode: 'alpha',
        } as CSSProperties;
        return (
            <span
                className={cn('inline-flex size-4 shrink-0 items-center justify-center bg-current', className)}
                style={maskStyle}
                title={title}
                aria-hidden={isDecorative ? true : undefined}
                role={isDecorative ? undefined : 'img'}
                aria-label={isDecorative ? undefined : computedAlt}
            />
        );
    }

    return (
        <span
            className={cn('inline-flex size-4 shrink-0 items-center justify-center', className)}
            style={sizeStyle}
            title={title}
            aria-hidden={isDecorative ? true : undefined}
        >
            <img className={cn('h-full w-full object-contain', imgClassName)} src={src} alt={computedAlt} />
        </span>
    );
}

export default FileIcon;

export function getReturnUrl(poolId: string, origin: string, chainId: number, theme: string, expired: boolean) {
    const url = new URL(window.location.origin);
    url.pathname = window.location.pathname;
    url.searchParams.append('id', poolId);
    url.searchParams.append('origin', origin);
    url.searchParams.append('chainId', String(chainId));
    url.searchParams.append('theme', theme);
    url.searchParams.append('expired', String(expired));
    return url.href;
}

export function getReturnUrl({ poolId, origin, chainId, theme, expired, title, logoUrl }: TWidgetConfig) {
    const url = new URL(window.location.origin);
    url.pathname = window.location.pathname;
    url.searchParams.append('id', poolId);
    url.searchParams.append('origin', origin);
    url.searchParams.append('chainId', String(chainId));
    url.searchParams.append('theme', theme);
    url.searchParams.append('expired', String(expired));
    url.searchParams.append('logoUrl', String(logoUrl));
    url.searchParams.append('title', String(title));
    return url.href;
}

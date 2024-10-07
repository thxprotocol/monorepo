export function shortenAddress(address: `0x${string}` | string | undefined) {
    if (!address) return '';
    return `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`;
}

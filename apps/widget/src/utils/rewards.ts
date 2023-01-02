export enum RewardVariant {
    Referral = 0,
    ERC20 = 1,
    ERC721 = 2,
}

export function toNumber(value?: boolean) {
    return value === undefined ? 0 : Number(value);
}

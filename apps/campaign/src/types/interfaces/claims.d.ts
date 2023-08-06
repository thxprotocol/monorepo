type TClaimState = {
    error: string;
    claim: TClaim | null;
    erc721: TERC721 | null;
    metadata: TNFTMetadata | null;
};

type TClaim = {
    uuid: string;
    poolId: string;
    error: string;
};
type TQRCodeState = {
    error: string;
    claim: TClaim | null;
    erc721: TERC721 | null;
    metadata: TNFTMetadata | null;
};

type TQRCode = {
    uuid: string;
    poolId: string;
    error: string;
};

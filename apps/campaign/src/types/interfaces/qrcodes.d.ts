type TQRCodeState = {
    entry: TQRCodeEntry | null;
    erc721: TERC721 | null;
    metadata: TNFTMetadata | null;
};

type TQRCodeEntry = {
    uuid: string;
    rewardId: string;
    sub: string;
};

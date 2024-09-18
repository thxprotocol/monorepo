type TQRCodeEntry = {
    // rewardId: string;
    _id: string;
    uuid: string;
    redirectURL: string;
    accountId: string;
    erc721Id: string;
    erc721MetadataId: string;

    erc721: TERC721;
    metadata: TERC721Metadata;

    // amount: number;
    sub: string;
    claimedAt: Date;

    error: string;
    account: TAccount;
    createdAt: Date;
};

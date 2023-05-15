type TPerkState = {
    perks: any[];
};

type TPerk = {
    uuid: string;
    image: string;
    nft: TERC721 | TERC1155;
    erc20: TERC20;
    title: string;
    amount: string;
    description: string;
    pointPrice: number;
    priceCurrency: string;
    price: number;
    isOwned: boolean;
    isPromoted: boolean;
    isDisabled: boolean;
    metadata: { attributes: { key: string; value: string }[] };
    erc1155Amount: number;
    progress: {
        limit: number;
        count: number;
    };
    expiry: {
        date: number;
        now: number;
    };
    isLocked: boolean;
    isOwner: boolean;
    tokenGatingContractAddress: string;
};

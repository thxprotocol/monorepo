type TRewardState = {
    rewards: any[];
};

type TReward = {
    uuid: string;
    poolId: string;
    image: string;
    erc20: TERC20;
    nft: TERC721 | TERC1155;
    metadata: TNFTMetadata;
    title: string;
    amount: string;
    description: string;
    pointPrice: number;
    priceCurrency: string;
    price: number;
    isPromoted: boolean;
    isDisabled: boolean;
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

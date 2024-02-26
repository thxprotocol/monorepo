type TRewardState = {
    rewards: any[];
    isLoading: boolean;
};

type TReward = {
    _id: string;
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
    chainId: ChainId;
    isPromoted: boolean;
    isDisabled: boolean;
    erc1155Amount: number;
    locks: { questId: string; variant: QuestVariant }[];
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

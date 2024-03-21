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
};

type TBaseRewardPayment = {
    _id: string;
    rewardId: string;
    poolId: string;
    amount: number;
    sub: string;
    createdAt: Date;
};

type TRewardGalachain = TReward & {
    contractChannelName: string;
    contractChaincodeName: string;
    contractContractName: string;
    tokenCollection: string;
    tokenCategory: string;
    tokenType: string;
    tokenAdditionalKey: string;
    amount: string;
    privateKey: string;
};

type TRewardGalachainPayment = TBaseRewardPayment & {
    amount: string;
};

type TRewardCoinPayment = TBaseRewardPayment & {
    //
};
type TRewardNFTPayment = TBaseRewardPayment & {
    //
};

type TRewardCustomPayment = TBaseRewardPayment & {
    //
};

type TRewardCouponPayment = TBaseRewardPayment & {
    code: string;
    webshopURL: string;
    couponCodeId: string;
};

type TRewardDiscordRolePayment = TRewardPayment & {
    discordRoleId: string;
    discordServerURL: string;
    role: { color: string; name: string };
};

type TRewardPayment =
    | TRewardCoinPayment
    | TRewardNFTPayment
    | TRewardCustomPayment
    | TRewardCouponPayment
    | TRewardDiscordRolePayment;

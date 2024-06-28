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
    variant: RewardVariant;
    locks: { questId: string; variant: QuestVariant }[];
    expiry: {
        date: number;
        now: number;
    };
    limitSupplyProgress: {
        count: number;
        max: number;
    };
    limitProgress: { count: number; max: number };
    author: {
        username: string;
    };
    isLimitReached: boolean;
    isLimitSupplyReached: boolean;
    isLocked: boolean;
    isAvailable: boolean;
    isOwner: boolean;
    paymentCount: number;
    createdAt: Date;
};

type TRewardCoin = TReward & {
    //
};

type TRewardNFT = TReward & {
    //
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
    couponCodeId: string;
    brand: {
        name: string;
        logoImgURL: string;
    };
    reward: {
        title: string;
        webshopURL: string;
    };
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

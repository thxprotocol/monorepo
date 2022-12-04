type TBaseReward = {
    _id?: string;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    expiryDate: Date;
    claimAmount: number;
    rewardLimit: number;
    platform: RewardConditionPlatform;
    interaction?: RewardConditionInteraction;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
    progress?: number;
    page?: number;
    claims?: any[];
};

type TERC20 = {
    balance: number;
    symbol: string;
    name: string;
    logoImg: string;
};
type TPointReward = TBaseReward & {
    amount: number;
    component?: string;
};

type TReferralReward = TBaseReward & {
    amount: number;
    referralUrl?: string;
    component?: string;
};
type TState = {
    erc20s: IERC20[];
    rewards: IReward[];
};

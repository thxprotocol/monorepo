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
    logoImgUrl: string;
};
type TPointReward = TBaseReward & {
    amount: number;
    component?: string;
    isClaimed?: boolean;
};

type TReferralReward = TBaseReward & {
    amount: number;
    referralUrl?: string;
    component?: string;
};

type TRewardState = {
    rewards: IReward[];
};

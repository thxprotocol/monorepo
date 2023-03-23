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
    contentMetadata?: string;
    createdAt?: string;
    updatedAt?: string;
    progress?: number;
    page?: number;
    claims?: any[];
};

type TPointReward = TBaseReward & {
    amount: number;
    component?: string;
    isClaimed?: boolean;
};

type TMilestoneReward = TBaseReward & {
    amount: number;
    component?: string;
    isClaimed?: boolean;
    claims: TMilestoneRewardClaim[];
};

type TReferralReward = TBaseReward & {
    amount: number;
    referralUrl?: string;
    component?: string;
};

type TRewardState = {
    rewards: IReward[];
};

type TMilestoneRewardClaim = {
    milestoneRewardId: string;
    sub: string;
    uuid: string;
    amount: string;
    isClaimed: boolean;
};

type TDailyRewardClaim = {
    dailyRewardId: string;
    sub: string;
    uuid: string;
    amount: string;
    isClaimed?: boolean;
};

type TDailyReward = TBaseReward & {
    uuid: string;
    amount: number;
    claims: TDailyRewardClaim[];
};

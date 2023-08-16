type TInfoLink = {
    label: string;
    url: string;
};

type TQuestFilter = {
    label: string;
    key: QuestVariant;
    icon: string;
};

type TQuestSort = {
    label: string;
    key: QuestVariant;
};

type TBaseQuest = {
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
    contentMetadata?: any;
    createdAt?: string;
    updatedAt?: string;
    progress?: number;
    page?: number;
    claims?: any[];
    variant: QuestVariant;
    infoLinks: TInfoLink[];
};

type TQuestState = {
    rewards: IReward[];
    leaderboard: { score; wallet; questsCompleted }[];
};

type TQuestSocial = TBaseQuest & {
    amount: number;
    component?: string;
    isClaimed?: boolean;
};

type TQuestCustom = TBaseQuest & {
    amount: number;
    component?: string;
    isClaimed?: boolean;
    claims: TQuestCustomClaim[];
};

type TQuestInvite = TBaseQuest & {
    pathname: string;
    amount: number;
    referralUrl?: string;
    component?: string;
};

type TQuestDaily = TBaseQuest & {
    uuid: string;
    amount: number;
    amounts: number[];
    claims: TDailyRewardClaim[];
};

type TQuestWeb3 = TBaseQuest & {
    amount: number;
    contracts: { chainId: ChainId; address: string }[];
    methodName: string;
    threshold: number;
    isClaimed: boolean;
};

type TQuestCustomClaim = {
    milestoneRewardId: string;
    sub: string;
    uuid: string;
    amount: string;
    isClaimed: boolean;
};

type TQuestDailyClaim = {
    dailyRewardId: string;
    sub: string;
    uuid: string;
    amount: string;
    isClaimed?: boolean;
};

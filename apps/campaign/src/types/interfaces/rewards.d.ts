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
    _id: string;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    image: string;
    variant: QuestVariant;
    infoLinks: TInfoLink[];
    component: string;
    createdAt: string;
    updatedAt: string;
};

type TQuestState = {
    rewards: IReward[];
    leaderboard: { score; wallet; questsCompleted }[];
};

type TQuestSocial = TBaseQuest & {
    amount: number;
    platform: RewardConditionPlatform;
    interaction?: RewardConditionInteraction;
    content?: string;
    contentMetadata?: any;
    isClaimed?: boolean;
};

type TQuestCustom = TBaseQuest & {
    amount: number;
    isClaimed?: boolean;
    claims: TQuestCustomClaim[];
};

type TQuestInvite = TBaseQuest & {
    pathname: string;
    amount: number;
    referralUrl?: string;
};

type TQuestDaily = TBaseQuest & {
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

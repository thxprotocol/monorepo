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
    locks: { questId: string; variant: QuestVariant }[];
    isHidden: boolean;
    expiryDate: Date;
};

type TAnyQuest = (TQuestSocial | TQuestCustom | TQuestInvite | TQuestDaily | TQuestWeb3) & { isClaimed: boolean };

type TJob = {
    name: string;
    lastRunAt: Date;
};

type TJobState = {
    [jobId: string]: TJob;
};

type TQuestState = {
    jobs: TJobState;
    quests: TAnyQuest[];
    isLoading: boolean;
};

type TQuestSocial = TBaseQuest & {
    amount: number;
    pointsAvailable: number;
    platform: RewardConditionPlatform;
    interaction?: RewardConditionInteraction;
    content?: string;
    contentMetadata?: any;
    isClaimed?: boolean;
    restartDates?: {
        start: Date;
        end: Date;
    };
    messages: any[];
};
type TEvent = {
    sub: string;
    identity: string;
    name: string;
    poolId: string;
};

type TQuestCustom = TBaseQuest & {
    limit: number;
    amount: number;
    isClaimed?: boolean;
    claims: TQuestCustomClaim[];
    events: TEvent[];
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
    isDisabled: boolean;
    claimAgainDuration;
    pointsAvailable: number;
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

type TCouponRewardPayment = {
    perkId: string;
    code: string;
    webshopURL: string;
    couponCodeId: string;
    walletId: string;
    sub: string;
    poolId: string;
    amount: number;
};

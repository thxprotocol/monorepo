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
    amount: number;
    component: string;
    createdAt: string;
    updatedAt: string;
    locks: { questId: string; variant: QuestVariant }[];
    isAvailable: boolean;
    isLocked: boolean;
    isCompleted: boolean;
    expiryDate: Date;
};

type TAnyQuest = TQuestSocial | TQuestCustom | TQuestInvite | TQuestDaily | TQuestWeb3 | TQuestGitcoin;

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
    kind: AccessTokenKind;
    interaction: QuestSocialRequirement;
    content: string;
    contentMetadata?: any;
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
    isClaimed?: boolean;
    claims: TQuestCustomClaim[];
    events: TEvent[];
};

type TQuestInvite = TBaseQuest & {
    pathname: string;
    referralUrl?: string;
};

type TQuestDaily = TBaseQuest & {
    amounts: number[];
    entries: TDailyRewardClaim[];
    claimAgainDuration;
};

type TQuestWeb3 = TBaseQuest & {
    contracts: { chainId: ChainId; address: string }[];
    methodName: string;
    threshold: number;
};

type TQuestGitcoin = TBaseQuest & {
    score: number;
};

type TQuestCustomClaim = {
    milestoneRewardId: string;
    sub: string;
    uuid: string;
    amount: string;
};

type TQuestDailyClaim = {
    dailyRewardId: string;
    sub: string;
    uuid: string;
    amount: string;
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

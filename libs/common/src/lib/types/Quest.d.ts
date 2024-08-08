type TQuest = TQuestDaily | TQuestInvite | TQuestSocial | TQuestCustom | TQuestWeb3 | TQuestGitcoin | TQuestWebhook;
type TQuestEntry =
    | TQuestDailyClaim
    | TQuestInviteEntry
    | TQuestSocialEntry
    | TQuestCustomEntry
    | TQuestWeb3Entry
    | TQuestGitcoinEntry
    | TQuestWebhookEntry;

type TQuestEntryMetadata = TQuestSocialEntryMetadata | TQuestWeb3EntryMetadata;
type TQuestLock = { variant: QuestVariant; questId: string };
type TValidationResult = {
    reason: string;
    result: boolean;
};

type TBaseQuestEntry = {
    poolId: string;
    questId: string;
    sub: string;
    amount: number;
    recaptcha: string;
    ip: string;
    status: QuestEntryStatus;
    createdAt: Date;
};

type TBaseQuest = {
    _id: string;
    variant: QuestVariant;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    index: number;
    image: string;
    infoLinks: TInfoLink[];
    expiryDate: Date;
    locks: TQuestLock[];
    isPublished: boolean;
    isIPLimitEnabled: boolean;
    isReviewEnabled: boolean;
    isAvailable: boolean;
    entries: TQuestEntry[];
    createdAt: string;
    updatedAt: string;
};

type TJobState = {
    [jobId: string]: TJob;
};

type TQuestState = {
    jobs: TJobState;
    quests: TAnyQuest[];
    isLoading: boolean;
};

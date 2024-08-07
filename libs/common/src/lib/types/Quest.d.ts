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
    createdAt: string;
    updatedAt: string;
    update: (payload: Partial<TQuest>) => Promise<void>;
    delete: (payload: Partial<TQuest>) => Promise<void>;
};

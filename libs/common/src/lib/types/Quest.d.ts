type TQuest = TDailyReward | TQuestInvite | TQuestSocial | TQuestCustom | TQuestWeb3 | TGitcoinQuest;
type TQuestEntry =
    | TDailyRewardClaim
    | TQuestInviteEntry
    | TQuestSocialEntry
    | TQuestCustomEntry
    | TQuestWeb3Entry
    | TGitcoinQuestEntry;

type TValidationResult = {
    reason: string;
    result: boolean;
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

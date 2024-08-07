type TQuestDailyEntry = TBaseQuestEntry & {
    metadata: TQuestDailyEntryMetadata;
};

type TQuestDailyEntryMetadata = {
    ip: string;
    state: DailyRewardClaimState;
};

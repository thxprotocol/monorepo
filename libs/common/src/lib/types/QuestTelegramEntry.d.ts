type TQuestTelegramEntry = TBaseQuestEntry & {
    account?: TAccount;
    wallet?: TWallet;
    metadata: TQuestTelegramEntryMetadata;
};

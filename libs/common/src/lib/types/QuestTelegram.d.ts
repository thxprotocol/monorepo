type TQuestTelegram = TBaseQuest & {
    amount: number;
    isAvailable: boolean;
    isCompleted: boolean;
    isClaimed: boolean;
};

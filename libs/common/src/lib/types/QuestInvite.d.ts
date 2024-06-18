type TQuestInvite = TBaseQuest & {
    amount: number;
    amountInvitee: number;
    requiredQuest: { questId: string; variant: QuestVariant };
    codes: TQuestInviteCode[];
};

type TInvitee = { username: string; createdAt: Date };

type TQuestInviteCode = {
    questId: string;
    sub: string;
    code: string;
};

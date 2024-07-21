type TQuestInvite = TBaseQuest & {
    amount: number;
    amountInvitee: number;
    requiredQuest: { questId: string; variant: QuestVariant };
    uses: number;
    codes: TQuestInviteCode[];
};

type TInvitee = { username: string; createdAt: Date };

type TQuestInviteCode = {
    questId: string;
    sub: string;
    code: string;
};

type TQuestInviteInvitee = {
    questId: string;
    sub: string;
    code: string;
};

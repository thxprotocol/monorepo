type TQuestInvite = TBaseQuest & {
    amount: number;
    amountInvitee: number;
    requiredQuests: { questId: string; variant: TQuest }[];
};

type TQuestInviteCode = {
    questId: string;
    sub: string;
    code: string;
};

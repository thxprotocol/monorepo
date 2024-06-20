type TQuestInviteEntry = {
    questId: string;
    sub: string;
    amount: string;
    metadata: {
        code: string;
        inviter: string;
    };
};

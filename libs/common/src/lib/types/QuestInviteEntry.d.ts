type TQuestInviteEntry = TBaseQuestEntry & {
    metadata: {
        code: string;
        inviter: string;
    };
};

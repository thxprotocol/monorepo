import mongoose from 'mongoose';

export type QuestInviteEntryDocument = mongoose.Document & TQuestInviteEntry;

export const QuestInviteEntry = mongoose.model<QuestInviteEntryDocument>(
    'QuestInviteEntry',
    new mongoose.Schema(
        {
            questId: String,
            sub: String,
            amount: String,
            metadata: {
                code: String,
                inviter: String,
            },
        },
        { timestamps: true },
    ),
    'questinviteentry',
);

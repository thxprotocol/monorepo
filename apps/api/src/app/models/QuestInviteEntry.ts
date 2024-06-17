import mongoose from 'mongoose';

export type QuestInviteEntryDocument = mongoose.Document & TQuestInviteEntry;

export const QuestInviteEntry = mongoose.model<QuestInviteEntryDocument>(
    'QuestInviteEntry',
    new mongoose.Schema(
        {
            questId: String,
            sub: String,
            code: String,
            amount: String,
        },
        { timestamps: true },
    ),
    'questinviteentry',
);

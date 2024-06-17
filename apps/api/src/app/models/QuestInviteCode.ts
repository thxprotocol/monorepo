import mongoose from 'mongoose';

export type QuestInviteCodeDocument = mongoose.Document & TQuestInviteCode;

export const QuestInviteCode = mongoose.model<QuestInviteCodeDocument>(
    'QuestInviteCode',
    new mongoose.Schema(
        {
            questId: String,
            sub: String,
            code: String,
        },
        { timestamps: true },
    ),
    'questinvitecode',
);

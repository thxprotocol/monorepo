import mongoose from 'mongoose';

export type QuestInviteInviteeDocument = mongoose.Document & TQuestInviteInvitee;

export const QuestInviteInvitee = mongoose.model<QuestInviteInviteeDocument>(
    'QuestInviteInvitee',
    new mongoose.Schema(
        {
            questId: String,
            code: String,
            sub: String,
        },
        { timestamps: true },
    ),
    'questinviteinvitee',
);

import mongoose from 'mongoose';
import { questEntrySchema } from './Quest';

export type QuestInviteEntryDocument = mongoose.Document & TQuestInviteEntry;

export const QuestInviteEntry = mongoose.model<QuestInviteEntryDocument>(
    'QuestInviteEntry',
    new mongoose.Schema(
        {
            ...questEntrySchema,
            metadata: {
                code: String,
                inviter: String,
            },
        },
        { timestamps: true },
    ),
    'questinviteentry',
);

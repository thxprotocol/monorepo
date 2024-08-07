import mongoose from 'mongoose';
import { questEntrySchema } from './Quest';

export type QuestDailyEntryDocument = mongoose.Document & TQuestDailyEntry;

export const QuestDailyEntry = mongoose.model<QuestDailyEntryDocument>(
    'QuestDailyEntry',
    new mongoose.Schema(
        {
            ...questEntrySchema,
            metadata: {
                state: Number,
                ip: String,
            },
        },
        { timestamps: true },
    ),
    'questdailyentry',
);

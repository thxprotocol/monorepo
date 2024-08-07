import mongoose from 'mongoose';
import { questEntrySchema } from './Quest';

export type QuestCustomEntryDocument = mongoose.Document & TQuestCustomEntry;

export const QuestCustomEntry = mongoose.model<QuestCustomEntryDocument>(
    'QuestCustomEntry',
    new mongoose.Schema(
        {
            ...questEntrySchema,
            eventName: String,
        },
        { timestamps: true },
    ),
    'questcustomentry',
);

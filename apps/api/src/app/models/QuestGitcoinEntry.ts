import mongoose from 'mongoose';
import { questEntrySchema } from './Quest';

export type QuestGitcoinEntryDocument = mongoose.Document & TQuestGitcoinEntry;

export const QuestGitcoinEntry = mongoose.model<QuestGitcoinEntryDocument>(
    'QuestGitcoinEntry',
    new mongoose.Schema(
        {
            ...questEntrySchema,
            metadata: {
                address: String,
                score: Number,
            },
        },
        { timestamps: true },
    ),
    'questgitcoinentry',
);

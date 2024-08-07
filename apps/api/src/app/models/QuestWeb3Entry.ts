import mongoose from 'mongoose';
import { questEntrySchema } from './Quest';

export type QuestWeb3EntryDocument = mongoose.Document & TQuestWeb3Entry;

export const QuestWeb3Entry = mongoose.model<QuestWeb3EntryDocument>(
    'QuestWeb3Entry',
    new mongoose.Schema(
        {
            ...questEntrySchema,
            metadata: {
                chainId: Number,
                callResult: String,
                address: String,
            },
        },
        { timestamps: true },
    ),
    'questweb3entry',
);

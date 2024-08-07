import mongoose from 'mongoose';
import { questEntrySchema } from './Quest';

export type QuestWebhookEntryDocument = mongoose.Document & TQuestWebhookEntry;

export const QuestWebhookEntry = mongoose.model<QuestWebhookEntryDocument>(
    'QuestWebhookEntry',
    new mongoose.Schema(
        {
            ...questEntrySchema,
            webhookId: String,
            identityId: String,
        },
        { timestamps: true },
    ),
    'questwebhookentry',
);

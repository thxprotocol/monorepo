import mongoose from 'mongoose';

export type WebhookDocument = mongoose.Document & TWebhook;

export const Webhook = mongoose.model<WebhookDocument>(
    'Webhook',
    new mongoose.Schema(
        {
            sub: String,
            url: String,
            signingSecret: String,
            active: { default: false, type: Boolean },
        },
        { timestamps: true },
    ),
    'webhook',
);

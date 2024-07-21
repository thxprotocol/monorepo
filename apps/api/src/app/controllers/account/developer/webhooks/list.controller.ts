import { Request, Response } from 'express';
import { Webhook, WebhookDocument } from '@thxnetwork/api/models/Webhook';
import { WebhookRequest } from '@thxnetwork/api/models/WebhookRequest';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const webhooks = await Webhook.find({ sub: req.auth.sub });
    const response = await Promise.all(
        webhooks.map(async (webhook: WebhookDocument) => {
            const webhookRequests = await WebhookRequest.find({ webhookId: webhook.id })
                .sort({ createdAt: -1 })
                .limit(50);
            return {
                ...webhook.toJSON(),
                webhookRequests,
            };
        }),
    );
    res.json(response);
};

export { controller, validation };

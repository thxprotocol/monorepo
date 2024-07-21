import { body } from 'express-validator';
import { Request, Response } from 'express';
import { Webhook } from '@thxnetwork/api/models/Webhook';
import { getSigningSecret } from '@thxnetwork/api/util/signingsecret';

const validation = [body('url').isURL({ require_tld: false })];

const controller = async (req: Request, res: Response) => {
    const webhook = await Webhook.create({
        sub: req.auth.sub,
        url: req.body.url,
        signingSecret: getSigningSecret(64),
    });

    res.status(201).json({ ...webhook.toJSON(), webhookRequests: [] });
};

export { controller, validation };

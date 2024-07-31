import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Event, Identity, Client } from '@thxnetwork/api/models';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [body('event').isString().isLength({ min: 0, max: 50 }), body('identityUuid').isUUID()];

const controller = async (req: Request, res: Response) => {
    const { identityUuid, event } = req.body;
    const secret = req.header('X-API-KEY');
    if (!secret) throw new BadRequestError('Missing X-API-KEY header');

    const client = await Client.findOne({ secret });
    if (!client) throw new NotFoundError('Could not find client for API key');

    const identity = await Identity.findOne({ uuid: identityUuid });
    if (!identity) throw new NotFoundError('Could not find ID for uuid');

    await Event.create({ name: event, sub: client.sub, identityId: identity._id });

    res.status(201).end();
};

export { controller, validation };

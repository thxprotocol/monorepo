import { Request, Response } from 'express';
import { Identity, Client } from '@thxnetwork/api/models';
import { NotFoundError, BadRequestError } from '@thxnetwork/api/util/errors';
import { uuidV1 } from '@thxnetwork/api/util/uuid';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const secret = req.header('X-API-KEY');
    if (!secret) throw new BadRequestError('Missing X-API-KEY header');

    const client = await Client.findOne({ secret });
    if (!client) throw new NotFoundError('Could not find client for this API key');

    const uuid = uuidV1();
    const id = await Identity.create({ sub: client.sub, uuid });

    res.json(id.uuid);
};

export { controller, validation };

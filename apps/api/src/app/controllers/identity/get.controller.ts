import { Request, Response } from 'express';
import { Client } from '@thxnetwork/api/models';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import IdentityService from '@thxnetwork/api/services/IdentityService';

const validation = [param('salt').isString().isLength({ min: 0 })];

const controller = async (req: Request, res: Response) => {
    const secret = req.header('X-API-KEY');
    if (!secret) throw new BadRequestError('Missing X-API-KEY header');

    const client = await Client.findOne({ secret });
    if (!client) throw new NotFoundError('Could not find client for this API key');

    const identity = await IdentityService.getIdentityForSalt(client.sub, req.params.salt);
    res.json(identity.uuid);
};

export { controller, validation };

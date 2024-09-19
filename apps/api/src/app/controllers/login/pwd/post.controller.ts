import { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [body('message').isString(), body('signature').isString()];

async function controller(req: Request, res: Response) {
    const address = NetworkService.recoverSigner(req.body.message, req.body.signature);
    if (!address) throw new BadRequestError('Invalid signature');

    const password = AccountProxy.createPassword(address);
    if (!password) throw new BadRequestError('Password not created');

    res.json({ password });
}

export default { validation, controller };

import { Request, Response } from 'express';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const result = await AccountProxy.checkReferral(req.auth.sub);

    res.json(result);
};

export default { controller, validation };

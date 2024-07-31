import { Request, Response } from 'express';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const { name } = req.body;
    const client = await ClientProxy.create(req.auth.sub, { name });

    res.json(client);
};

export { controller, validation };

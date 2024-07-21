import { Request, Response } from 'express';
import { Client } from '@thxnetwork/api/models/Client';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';

const controller = async (req: Request, res: Response) => {
    const clients = await Client.find({ sub: req.auth.sub });
    const promises = clients.map(async (client) => {
        return await ClientProxy.getCredentials(client.toJSON());
    });
    const result = await Promise.all(promises);

    res.status(200).json(result);
};

export { controller };

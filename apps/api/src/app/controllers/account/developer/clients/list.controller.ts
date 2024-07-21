import { Request, Response } from 'express';
import { Client } from '@thxnetwork/api/models/Client';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import { Pool } from '@thxnetwork/api/models';

const controller = async (req: Request, res: Response) => {
    const pools = await Pool.find({ sub: req.auth.sub });
    const poolIds = pools.map((pool) => pool.id);

    const clients = await Client.find({ $or: [{ sub: req.auth.sub }, { poolId: { $in: poolIds } }] });
    const promises = clients.map(async (client) => {
        return await ClientProxy.getCredentials(client.toJSON());
    });
    const result = await Promise.all(promises);

    res.status(200).json(result);
};

export { controller };

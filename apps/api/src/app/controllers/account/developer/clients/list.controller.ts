import { Request, Response } from 'express';
import { Client } from '@thxnetwork/api/models/Client';

const controller = async (req: Request, res: Response) => {
    const clients = await Client.find({ sub: req.auth.sub });
    res.json(clients);
};

export { controller };

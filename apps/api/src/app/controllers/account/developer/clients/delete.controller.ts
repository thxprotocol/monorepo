import { Request, Response } from 'express';
import { param } from 'express-validator';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await ClientProxy.remove(req.params.id);

    res.status(204).end();
};

export { controller, validation };

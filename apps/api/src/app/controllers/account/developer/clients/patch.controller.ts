import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [param('id').isMongoId(), body('name').exists()];

const controller = async (req: Request, res: Response) => {
    const client = await ClientProxy.update(req.params.id, { name: req.body.name });
    res.json(client);
};

export { validation, controller };

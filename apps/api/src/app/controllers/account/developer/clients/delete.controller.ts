import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Client } from '@thxnetwork/api/models';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const client = await Client.findById(req.params.id);
    if (!client) throw new NotFoundError('Client not found');

    await client.deleteOne();

    res.status(204).end();
};

export { controller, validation };

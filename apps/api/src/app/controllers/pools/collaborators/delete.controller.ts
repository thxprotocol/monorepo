import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Collaborator } from '@thxnetwork/api/models/Collaborator';

const validation = [param('id').isMongoId(), param('uuid').isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const collaborator = await Collaborator.findOne({ poolId: pool._id, uuid: req.params.uuid });
    if (!collaborator) throw new NotFoundError('Could not find collaborator');

    await collaborator.deleteOne();

    res.status(204).end();
};

export { controller, validation };

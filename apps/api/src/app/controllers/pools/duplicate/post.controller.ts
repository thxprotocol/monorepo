import { param } from 'express-validator';
import { Request, Response } from 'express';
import { Pool } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.params.id);
    const duplicatePool = await PoolService.deploy(req.auth.sub, `${pool.settings.title} (clone)`);

    // Duplicate Quests
    // TODO

    // Duplicate Rewards
    // TODO

    res.status(201).json(duplicatePool.toJSON());
};

export { controller, validation };

import { Request, Response } from 'express';
import { param } from 'express-validator';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { Pool } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.params.id);

    const duplicatePool = await PoolService.deploy(req.auth.sub, `${pool.settings.title} (clone)`);

    // Deploy a Safe for the campaign
    const safe = await SafeService.create({ sub: req.auth.sub, safeVersion, poolId: duplicatePool.id });
    // Update predicted safe address for pool
    await pool.updateOne({ safeAddress: safe.address });

    // Duplicate Quests
    // TODO

    // Duplicate Rewards
    // TODO

    res.status(201).json({ ...duplicatePool.toJSON(), safeAddress: safe.address, safe });
};

export { controller, validation };

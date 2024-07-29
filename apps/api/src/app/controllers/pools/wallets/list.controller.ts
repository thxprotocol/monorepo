import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Pool, Wallet } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.params.id);
    if (!pool) throw new NotFoundError('Pool not found');

    const wallets = await Wallet.find({ poolId: req.params.id, sub: pool.sub });
    res.json(wallets);
};

export { controller, validation };

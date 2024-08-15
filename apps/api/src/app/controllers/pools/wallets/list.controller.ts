import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Pool, Transaction, Wallet } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { PromiseParser } from '@thxnetwork/api/util';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.params.id);
    if (!pool) throw new NotFoundError('Pool not found');

    const wallets = await Wallet.find({ poolId: req.params.id, sub: pool.sub });
    const response = await PromiseParser.parse(
        wallets.map(async (wallet) => {
            const transactions = await Transaction.find({ walletId: wallet.id }).sort({ createdAt: -1 }).limit(50);
            return { ...wallet.toJSON(), transactions };
        }),
    );

    res.json(response);
};

export { controller, validation };

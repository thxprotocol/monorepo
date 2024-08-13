import { Request, Response } from 'express';
import { query } from 'express-validator';
import { Transaction, Wallet } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [query('chainId').isNumeric(), query('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const wallet = await Wallet.findById(req.query.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const txs = await Transaction.find({ walletId: wallet.id });

    res.json(txs);
};

export default { controller, validation };

import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Transaction, Wallet } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const wallet = await Wallet.findById(req.params.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const txs = await Transaction.find({ walletId: wallet.id }).sort({ createdAt: -1 });

    res.json(txs);
};

export default { controller, validation };

import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Transaction, Wallet } from '@thxnetwork/api/models';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('transactionId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const tx = await Transaction.findById(req.params.transactionId);
    if (!tx) throw new NotFoundError('Transaction not found');

    const wallet = await Wallet.findById(tx.walletId);
    if (wallet.sub === req.auth.sub) throw new ForbiddenError('Transaction not owned by sub.');

    res.json(tx);
};

export default { controller, validation };

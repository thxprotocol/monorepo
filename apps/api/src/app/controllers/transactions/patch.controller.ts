import { Transaction, Wallet } from '@thxnetwork/api/models';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { TransactionState } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [param('id').isMongoId(), body('state').isInt().isIn(Object.values(TransactionState))];

const controller = async (req: Request, res: Response) => {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) throw new NotFoundError('Transaction not found');

    const wallet = await Wallet.findById(tx.walletId);
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Transaction not owned by sub.');

    await tx.updateOne({ state: req.body.state });

    res.json(tx);
};

export default { controller, validation };

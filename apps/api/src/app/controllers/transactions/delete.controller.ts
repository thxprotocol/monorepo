import { Transaction, Wallet } from '@thxnetwork/api/models';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) throw new NotFoundError('Transaction not found');

    const wallet = await Wallet.findById(tx.walletId);
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Transaction not owned by sub.');

    await tx.deleteOne();

    res.status(204).end();
};

export default { controller, validation };

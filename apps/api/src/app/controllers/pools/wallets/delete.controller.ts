import { Wallet } from '@thxnetwork/api/models';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const wallet = await Wallet.findById(req.params.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Not your wallet');

    await wallet.deleteOne();

    res.status(204).end();
};

export { controller, validation };

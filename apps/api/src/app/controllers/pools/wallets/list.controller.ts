import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Wallet } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const wallets = await Wallet.find({ poolId: req.params.id, sub: req.auth.sub });
    res.json(wallets);
};

export { controller, validation };

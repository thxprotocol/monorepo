import { Transaction, Wallet } from '@thxnetwork/api/models';
import { PromiseParser } from '@thxnetwork/api/util';
import { Request, Response } from 'express';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const wallets = await Wallet.find({ sub: req.auth.sub, owners: { $exists: true, $size: 1 } });
    const response = await PromiseParser.parse(
        wallets.map(async (wallet) => {
            const transactions = await Transaction.find({ walletId: wallet.id }).sort({ createdAt: -1 }).limit(50);
            return { ...wallet.toJSON(), transactions };
        }),
    );

    res.json(response);
};

export { controller, validation };

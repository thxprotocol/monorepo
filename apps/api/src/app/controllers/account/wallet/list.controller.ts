import WalletService from '@thxnetwork/api/services/WalletService';
import { Request, Response } from 'express';
import { query } from 'express-validator';

const validation = [query('chainId').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const wallets = await WalletService.list(req.auth);
    res.json(wallets);
};

export default { controller, validation };

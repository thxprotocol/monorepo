import { Request, Response } from 'express';
import { query } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [query('chainId').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const wallets = await WalletService.list(req.auth);
    res.json(wallets);
};

export default { controller, validation };

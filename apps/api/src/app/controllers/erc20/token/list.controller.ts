import { Request, Response } from 'express';
import { query } from 'express-validator';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('walletId').isMongoId(), query('chainId').isInt()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.query.chainId);
    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    const tokens = await ERC20Service.getTokensForWallet(wallet, chainId);

    res.json(tokens.reverse());
};

export { controller, validation };

import { Request, Response } from 'express';
import { query } from 'express-validator';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [query('walletId').isMongoId(), query('chainId').isInt()];

const controller = async (req: Request, res: Response) => {
    const { chainId, walletId } = req.query;
    const wallet = await WalletService.findById(walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    const tokens = await ERC20Service.getTokensForWallet(wallet, Number(chainId));

    res.json(tokens.reverse());
};

export { controller, validation };

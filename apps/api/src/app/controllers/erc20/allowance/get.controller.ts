import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { ChainId } from '@thxnetwork/common/enums';

const validation = [
    query('tokenAddress').isEthereumAddress(),
    query('spender').isEthereumAddress(),
    query('walletId').isMongoId(),
    query('chainId').isInt(),
];

const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const tokenAddress = req.query.tokenAddress as string;
    const chainId = Number(req.query.chainId) as ChainId;

    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const contract = ContractService.getContract('THXERC20_LimitedSupply', chainId, tokenAddress);
    const allowance = await contract.allowance(wallet.address, req.query.spender);

    res.json({ allowanceInWei: allowance.toString() });
};
export { controller, validation };

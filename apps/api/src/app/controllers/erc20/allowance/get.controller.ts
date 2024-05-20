import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [
    query('tokenAddress').isEthereumAddress(),
    query('spender').isEthereumAddress(),
    query('walletId').isMongoId(),
];

const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const contract = ContractService.getContract(
        'THXERC20_LimitedSupply',
        wallet.chainId,
        req.query.tokenAddress as string,
    );
    const allowance = await contract.allowance(wallet.address, req.query.spender);

    res.json({ allowanceInWei: allowance.toString() });
};
export { controller, validation };

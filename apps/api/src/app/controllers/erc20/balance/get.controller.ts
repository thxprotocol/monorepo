import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import WalletService from '@thxnetwork/api/services/WalletService';
import { getProvider } from '@thxnetwork/api/util/network';
import { getArtifact } from '@thxnetwork/api/hardhat';

const validation = [query('walletId').isMongoId(), query('tokenAddress').isEthereumAddress()];

const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const { web3 } = getProvider(wallet.chainId);
    const { abi } = getArtifact('THXERC20_LimitedSupply');
    const contract = new web3.eth.Contract(abi, req.query.tokenAddress as string);
    const balance = await contract.methods.balanceOf(wallet.address).call();

    res.json({ balanceInWei: balance.toString() });
};
export { controller, validation };

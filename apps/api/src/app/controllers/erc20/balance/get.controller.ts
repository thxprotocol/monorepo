import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import WalletService from '@thxnetwork/api/services/WalletService';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { getArtifact } from '@thxnetwork/api/hardhat';
import { ChainId } from '@thxnetwork/common/enums';

const validation = [query('walletId').isMongoId(), query('tokenAddress').isEthereumAddress(), query('chainId').isInt()];

const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const chainId = Number(req.query.chainId) as ChainId;

    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const { web3 } = NetworkService.getProvider(chainId);
    const { abi } = getArtifact('THXERC20_LimitedSupply');
    const contract = new web3.eth.Contract(abi, req.query.tokenAddress as string);
    const balance = await contract.methods.balanceOf(wallet.address).call();

    res.json({ balanceInWei: balance.toString() });
};
export { controller, validation };

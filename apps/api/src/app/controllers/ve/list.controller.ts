import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { contractArtifacts, contractNetworks } from '@thxnetwork/api/hardhat';
import { query } from 'express-validator';
import { ChainId } from '@thxnetwork/common/enums';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import WalletService from '@thxnetwork/api/services/WalletService';
import VoteEscrowService, { chainId } from '@thxnetwork/api/services/VoteEscrowService';

const parseMs = (s) => Number(s) * 1000;

const validation = [query('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found.');

    const { web3 } = NetworkService.getProvider(ChainId.Polygon);
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, contractNetworks[chainId].VotingEscrow);

    // Check for lock and determine ve fn to call
    // Get veTHX balance and pending rewards
    const [{ amount, end }, latestBlock, balance, rewards] = await Promise.all([
        VoteEscrowService.list(wallet),
        web3.eth.getBlock('latest'),
        ve.methods.balanceOf(wallet.address).call(),
        VoteEscrowService.listRewards(wallet),
    ]);

    res.json([{ balance, amount: amount.toString(), end: parseMs(end), now: parseMs(latestBlock.timestamp), rewards }]);
};

export { controller, validation };

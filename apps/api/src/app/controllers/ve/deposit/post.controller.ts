import { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { BigNumber } from 'alchemy-sdk';
import { contractNetworks } from '@thxnetwork/api/hardhat';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import VoteEscrowService, { chainId } from '@thxnetwork/api/services/VoteEscrowService';

const validation = [body('amountInWei').isString(), body('lockEndTimestamp').isInt(), query('walletId').isMongoId()];

const controller = async ({ body, wallet }: Request, res: Response) => {
    // Check sufficient BPTGauge approval
    const amount = await VoteEscrowService.getAllowance(
        wallet,
        contractNetworks[chainId].BPTGauge,
        contractNetworks[chainId].VotingEscrow,
    );
    if (BigNumber.from(amount).lt(body.amountInWei)) throw new ForbiddenError('Insufficient allowance');

    // Check lockEndTimestamp to be more than today + 3 months
    const { web3 } = NetworkService.getProvider(chainId);
    const latest = await web3.eth.getBlockNumber();
    const now = (await web3.eth.getBlock(latest)).timestamp;
    if (now > body.lockEndTimestamp) throw new ForbiddenError('lockEndTimestamp needs be larger than today');

    // Check SmartWalletWhitelist
    const isApproved = await VoteEscrowService.isApprovedAddress(wallet.address);
    if (!isApproved) throw new ForbiddenError('Wallet address is not on whitelist.');

    // Deposit funds for wallet
    const tx = await VoteEscrowService.deposit(wallet, body.amountInWei, body.lockEndTimestamp);

    res.status(201).json([tx]);
};
export { controller, validation };

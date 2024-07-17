import { getArtifact } from '@thxnetwork/api/hardhat';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { contractNetworks } from '@thxnetwork/api/hardhat';
import { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { BigNumber } from 'alchemy-sdk';
import LiquidityService from '@thxnetwork/api/services/LiquidityService';
import { ChainId } from '@thxnetwork/common/enums';

const validation = [body('amountInWei').isString(), query('walletId').isMongoId(), query('chainId').isInt()];

const controller = async ({ query, wallet, body }: Request, res: Response) => {
    const chainId = Number(query.chainId) as ChainId;
    const { web3 } = NetworkService.getProvider(chainId);
    const bpt = new web3.eth.Contract(getArtifact('BPT').abi, contractNetworks[wallet.chainId].BPT);

    // Check if sender has sufficient BPT
    const balanceInWei = await bpt.methods.balanceOf(wallet.address).call();
    if (BigNumber.from(balanceInWei).lt(body.amountInWei)) {
        throw new BadRequestError('Insufficient balance');
    }

    const tx = await LiquidityService.stake(wallet, body.amountInWei);

    res.status(201).json([tx]);
};
export { controller, validation };

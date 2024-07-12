import { Request, Response } from 'express';
import { fromWei } from 'web3-utils';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/common/enums';
import { logger } from '@thxnetwork/api/util/logger';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { ethers } from 'ethers';
import { getArtifact, contractNetworks } from '@thxnetwork/api/hardhat';
import { BigNumber } from 'alchemy-sdk';
import { name, version, license } from '../../../../package.json';

function handleError(error: Error) {
    logger.error(error);
    return { error: 'invalid response' };
}

async function getNetworkDetails(chainId: ChainId) {
    try {
        const { defaultAccount, web3, signer } = NetworkService.getProvider(chainId);
        const rfthx = new ethers.Contract(
            contractNetworks[chainId].RewardFaucet,
            getArtifact('RewardFaucet').abi,
            signer,
        );
        const registry = new ethers.Contract(
            contractNetworks[chainId].THXRegistry,
            getArtifact('THXRegistry').abi,
            signer,
        );
        const rdthx = new ethers.Contract(
            contractNetworks[chainId].RewardDistributor,
            getArtifact('RewardDistributor').abi,
            signer,
        );
        const bpt = new ethers.Contract(contractNetworks[chainId].BPT, getArtifact('BPT').abi, signer);
        const bptGauge = new ethers.Contract(contractNetworks[chainId].BPTGauge, getArtifact('BPTGauge').abi, signer);
        const veTHX = new ethers.Contract(
            contractNetworks[chainId].VotingEscrow,
            getArtifact('VotingEscrow').abi,
            signer,
        );
        const bal = new ethers.Contract(contractNetworks[chainId].BAL, getArtifact('BAL').abi, signer);
        // const thx = new ethers.Contract(contractNetworks[chainId].THX, contractArtifacts['THX'].abi, signer);
        // const usdc = new ethers.Contract(contractNetworks[chainId].USDC, contractArtifacts['USDC'].abi, signer);

        const address = {
            registry: registry.address,
            relayer: defaultAccount,
            bptGauge: bptGauge.address,
            bpt: bpt.address,
            bal: bal.address,
            thx: contractNetworks[chainId].THX,
            usdc: contractNetworks[chainId].USDC,
            vault: contractNetworks[chainId].BalancerVault,
        };

        const relayer = await Promise.all([
            {
                matic: fromWei(String(await web3.eth.getBalance(defaultAccount)), 'ether'),
                bpt: fromWei(String(await bpt.balanceOf(defaultAccount)), 'ether'),
                // bptGauge: fromWei(String(await bptGauge.balanceOf(defaultAccount)), 'ether'),
                // bal: fromWei(String(await bal.balanceOf(defaultAccount)), 'ether'),
                // thx: fromWei(String(await thx.balanceOf(defaultAccount)), 'ether'),
                // usdc: fromWei(String(await usdc.balanceOf(defaultAccount)), 'ether'),
            },
        ]);
        const total = fromWei(String(await rfthx.totalTokenRewards(bpt.address)), 'ether');
        const currentBlock = await web3.eth.getBlock('latest');
        const amountStaked = BigNumber.from(String(await bpt.balanceOf(bptGauge.address)));
        const amountSupply = BigNumber.from(String(await bpt.totalSupply()));
        const amountUnstaked = amountSupply.sub(amountStaked);
        const amountLocked = await bptGauge.balanceOf(veTHX.address);

        const metrics = {
            unstaked: fromWei(amountUnstaked.toString(), 'ether'),
            staked: fromWei(amountStaked.toString(), 'ether'),
            locked: fromWei(amountLocked.toString(), 'ether'),
        };
        const getRewards = async (tokenAddress: string, now: string) => {
            const currentWeek = fromWei(String(await rfthx.getTokenWeekAmounts(tokenAddress, now)), 'ether');
            const upcomingWeeks = (await rfthx.getUpcomingRewardsForNWeeks(tokenAddress, 4)).map((amount: BigNumber) =>
                fromWei(String(amount), 'ether'),
            );
            return [currentWeek, ...upcomingWeeks];
        };
        const distributor = {
            total,
            balances: await Promise.all([
                {
                    bpt: fromWei(String(bpt.address), 'ether'),
                    bal: fromWei(String(bal.address), 'ether'),
                },
            ]),
            rewards: {
                bpt: await getRewards(bpt.address, String(currentBlock.timestamp)),
                bal: await getRewards(bal.address, String(currentBlock.timestamp)),
            },
        };
        const splitter = new ethers.Contract(
            contractNetworks[chainId].THXPaymentSplitter,
            getArtifact('THXPaymentSplitter').abi,
            signer,
        );

        return {
            blockTime: new Date(Number(currentBlock.timestamp) * 1000),
            registry: {
                payoutRate: BigNumber.from(await registry.getPayoutRate())
                    .div(100)
                    .toString(),
                payee: await registry.getPayee(),
            },
            test: {
                rate: (await splitter.rates('0x029E2d4D2b6938c92c48dbf422a4e500425a08D8')).toString(),
                balance: (await splitter.balanceOf('0x029E2d4D2b6938c92c48dbf422a4e500425a08D8')).toString(),
            },
            address,
            relayer,
            metrics,
            distributor,
        };
    } catch (error) {
        return handleError(error);
    }
}

const controller = async (req: Request, res: Response) => {
    const jsonData = {
        name,
        version,
        license,
    };

    const result = {
        ...jsonData,
        networks: {},
    };

    if (NODE_ENV !== 'production') {
        result.networks[ChainId.Hardhat] = await getNetworkDetails(ChainId.Hardhat);
    } else {
        result.networks[ChainId.Polygon] = await getNetworkDetails(ChainId.Polygon);
    }

    res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
};

export { controller };

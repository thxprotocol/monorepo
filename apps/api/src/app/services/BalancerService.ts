import axios from 'axios';
import { ethers } from 'ethers';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { BALANCER_POOL_ID, ETHEREUM_RPC, HARDHAT_RPC, NODE_ENV, POLYGON_RPC } from '../config/secrets';
import { logger } from '../util/logger';
import { WalletDocument } from '../models';
import { ChainId } from '@thxnetwork/common/enums';
import { contractArtifacts, contractNetworks } from '@thxnetwork/api/hardhat';
import { BigNumber } from 'alchemy-sdk';
import { formatUnits } from 'ethers/lib/utils';

class BalancerService {
    pricing = {};
    apr = {
        [ChainId.Hardhat]: {
            balancer: {
                apr: 0,
                swapFees: 0,
            },
            thx: 0,
        },
        [ChainId.Polygon]: {
            balancer: {
                apr: 0,
                swapFees: 0,
            },
            thx: 0,
        },
    };
    tvl = {
        [ChainId.Hardhat]: { liquidity: '0', staked: '0', tvl: '0' },
        [ChainId.Polygon]: { liquidity: '0', staked: '0', tvl: '0' },
    };
    rewards = {
        [ChainId.Hardhat]: { bal: '0', bpt: '0' },
        [ChainId.Polygon]: { bal: '0', bpt: '0' },
    };
    schedule = {
        [ChainId.Hardhat]: { bal: [], bpt: [] },
        [ChainId.Polygon]: { bal: [], bpt: [] },
    };
    balancer = new BalancerSDK({
        network: Network.POLYGON,
        rpcUrl: POLYGON_RPC,
    });

    constructor() {
        this.updatePricesJob().then(() => {
            this.updateMetricsJob();
        });
    }

    async buildJoin(
        wallet: WalletDocument,
        usdcAmountInWei: string,
        thxAmountInWei: string,
        slippage: string,
    ): Promise<JoinPoolAttributes> {
        const pool = await this.balancer.pools.find(BALANCER_POOL_ID);
        const [usdc, thx] = pool.tokens as {
            address: string;
        }[];

        return pool.buildJoin(
            wallet.address,
            [usdc.address, thx.address],
            [usdcAmountInWei, thxAmountInWei],
            slippage,
        ) as JoinPoolAttributes;
    }

    getPricing() {
        return this.pricing;
    }

    getMetrics(chainId: ChainId) {
        return {
            apr: this.apr[chainId],
            tvl: this.tvl[chainId],
            rewards: this.rewards[chainId],
            schedule: this.schedule[chainId],
        };
    }

    async fetchPrice(symbolIn: string, symbolOut: string) {
        try {
            const { data } = await axios({
                method: 'GET',
                url: `https://api.coinbase.com/v2/exchange-rates?currency=${symbolIn}`,
            });

            return data.data.rates[symbolOut];
        } catch (error) {
            logger.error(error);
            return 0;
        }
    }

    async fetchPool() {
        try {
            return await this.balancer.pools.find(BALANCER_POOL_ID);
        } catch (error) {
            logger.error(error);
            return;
        }
    }

    async updatePricesJob() {
        const pool = await this.fetchPool();
        if (!pool) return;

        const [usdc, thx] = pool.tokens as unknown as {
            symbol: string;
            balance: number;
            token: { latestUSDPrice: number };
        }[];
        const totalShares = pool.totalShares as unknown as number;
        const thxValue = thx.balance * thx.token.latestUSDPrice;
        const usdcValue = usdc.balance * usdc.token.latestUSDPrice;
        const btpPrice = (thxValue + usdcValue) / totalShares;
        const balPrice = await this.fetchPrice('BAL', 'USDC');

        this.pricing = {
            'BAL': Number(balPrice),
            '20USDC-80THX': btpPrice,
            'USDC': Number(usdc.token.latestUSDPrice),
            'THX': Number(thx.token.latestUSDPrice),
        };
    }

    async updateMetricsJob() {
        try {
            const rpcMap = { [ChainId.Hardhat]: HARDHAT_RPC, [ChainId.Polygon]: POLYGON_RPC };
            const priceOfBAL = this.pricing['BAL'];
            const pricePerBPT = this.pricing['20USDC-80THX'];

            for (const chainId of [ChainId.Hardhat, ChainId.Polygon]) {
                // Skip hardhat on production
                if (['production', 'test'].includes(NODE_ENV) && chainId === ChainId.Hardhat) continue;

                const provider = new ethers.providers.JsonRpcProvider(rpcMap[chainId]);
                const gaugeAddress = contractNetworks[chainId].BPTGauge;
                const bptAddress = contractNetworks[chainId].BPT;
                const gauge = new ethers.Contract(gaugeAddress, contractArtifacts.BPTGauge.abi, provider);
                const bpt = new ethers.Contract(bptAddress, contractArtifacts.BPT.abi, provider);

                // veTHX contract on Polygon
                const veTHXAddress = contractNetworks[chainId].VotingEscrow;

                const { rewards, schedule } = await this.getRewards(chainId);
                this.rewards[chainId] = rewards;
                this.schedule[chainId] = schedule;

                // TVL is measured as the total amount of BPT-gauge locked in veTHX
                const liquidity = (await bpt.totalSupply()).toString();
                const staked = (await bpt.balanceOf(gauge.address)).toString();
                const tvl = (await gauge.balanceOf(veTHXAddress)).toString();
                this.tvl[chainId] = { liquidity, staked, tvl };

                // Calc APR
                const apr = await this.calculateBalancerAPR(gauge, priceOfBAL, pricePerBPT);
                const balancer = { apr, swapFees: 0.2 }; // TODO Fetch swapFees from SDK or contract
                const thx = await this.calculateTHXAPR(chainId);
                this.apr[chainId] = { balancer, thx };
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Eg (43294,435240 * 12) / 1232297,290257 * 100 = 42.2%
    async calculateTHXAPR(chainId: ChainId) {
        const monthlyEmissions = Number(formatUnits(this.rewards[chainId].bpt, 18));
        const tvl = Number(formatUnits(this.tvl[chainId].tvl, 18));
        return ((monthlyEmissions * 12) / tvl) * 100;
    }

    async calculateBalancerAPR(gauge: ethers.Contract, priceOfBAL: number, pricePerBPT: number) {
        // Balancer Gauge contracts on Ethereum
        const ethereumProvider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC);
        const gaugeControllerAddress = contractNetworks[ChainId.Ethereum].BalancerGaugeController;
        const gaugeController = new ethers.Contract(
            gaugeControllerAddress,
            contractArtifacts.BalancerGaugeController.abi,
            ethereumProvider,
        );
        const rootGaugeAddress = contractNetworks[ChainId.Ethereum].BalancerRootGauge;

        // APR formula inputs
        const gaugeRelWeight = Number((await gaugeController.gauge_relative_weight(rootGaugeAddress)).toString());
        const workingSupply = Number((await gauge.working_supply()).toString());

        // Take Balancer inflation schedule into account. Started at 140000 BAL per week
        // https://docs.balancer.fi/concepts/governance/bal-token.html#supply-inflation-schedule
        const weeklyBALemissions = 102530.48; // TODO add formula to calculate weekly emissions

        // APR formula as per
        // https://docs.balancer.fi/reference/vebal-and-gauges/apr-calculation.html

        // Example data May 4th 2024
        // const workingSupply = 8.102148903933154e23;
        // const gaugeRelWeight = 1518354055844830;
        // const weeklyBALemissions = 102530.48;
        // const priceOfBAL = 3.655;
        // const pricePerBPT = 0.04489925552408662;

        return (
            (((0.4 / (workingSupply + 0.4)) * gaugeRelWeight * weeklyBALemissions * 52 * priceOfBAL) / pricePerBPT) *
            100
        );
    }

    async getRewards(chainId: ChainId) {
        const rpcMap = {
            [ChainId.Hardhat]: HARDHAT_RPC,
            [ChainId.Polygon]: POLYGON_RPC,
        };
        const { BAL, BPT, RewardFaucet, RewardDistributor } = contractNetworks[chainId];
        const provider = new ethers.providers.JsonRpcProvider(rpcMap[chainId]);
        const rewardFaucet = new ethers.Contract(RewardFaucet, contractArtifacts['RewardFaucet'].abi, provider);
        const amountOfWeeks = '4';
        const [balSchedule, bptSchedule] = await Promise.all(
            [BAL, BPT].map(async (tokenAddress: string) => {
                const upcoming = await rewardFaucet.getUpcomingRewardsForNWeeks(tokenAddress, amountOfWeeks);
                return upcoming.map((amount: BigNumber) => amount.toString());
            }),
        );
        const [balTotal, bptTotal] = await Promise.all(
            [BAL, BPT].map(async (tokenAddress) => await rewardFaucet.totalTokenRewards(tokenAddress)),
        );

        // Add reward distributor BAL balance to the current week
        const balContract = new ethers.Contract(BAL, contractArtifacts['BAL'].abi, provider);
        const bptContract = new ethers.Contract(BPT, contractArtifacts['BPT'].abi, provider);
        const balBalance = await balContract.balanceOf(RewardDistributor);
        balSchedule[0] = BigNumber.from(balSchedule[0]).add(balBalance).toString();
        const bptBalance = await bptContract.balanceOf(RewardDistributor);
        bptSchedule[0] = BigNumber.from(bptSchedule[0]).add(bptBalance).toString();

        return {
            schedule: { bal: balSchedule, bpt: bptSchedule },
            rewards: { bal: balTotal.add(balBalance).toString(), bpt: bptTotal.add(bptBalance).toString() },
        };
    }
}

const service = new BalancerService();

export default service;

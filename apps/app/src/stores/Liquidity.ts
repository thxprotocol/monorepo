import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { BALANCER_POOL_ID, contractNetworks } from '../config/constants';
import { PoolWithMethods } from '@balancer-labs/sdk';
import { ChainId } from '@thxnetwork/common/enums';
import { track } from '@thxnetwork/common/mixpanel';
import { abi } from '../utils/abi';
import { useVeStore } from './VE';

type TCreateLiquidityOptions = {
    thxAmountInWei: string;
    usdcAmountInWei: string;
    slippage: string;
    pool: PoolWithMethods;
};

export const useLiquidityStore = defineStore('liquidity', {
    state: (): TLiquidityState => ({
        pricing: { 'THX': 0, 'USDC': 0, 'BAL': 0, '20USDC-80THX': 0 },
        apr: {
            balancer: { apr: 0, swapFees: 0 },
            thx: 0,
        },
        tvl: { liquidity: '0', staked: '0', tvl: '0' },
        rewards: { bal: '0', bpt: '0' },
        schedule: { bal: ['0', '0', '0', '0'], bpt: ['0', '0', '0', '0'] },
    }),
    getters: {
        chainId() {
            const { chainId } = useWalletStore();
            return [ChainId.Polygon, ChainId.Hardhat].includes(chainId) ? chainId : ChainId.Polygon;
        },
    },
    actions: {
        buildJoin(wallet: TWallet, data: TCreateLiquidityOptions) {
            if (this.chainId === ChainId.Hardhat) {
                const { encodeContractCall } = useWalletStore();
                return encodeContractCall(contractNetworks[this.chainId].BalancerVault, abi.BalancerVault, 'joinPool', [
                    BALANCER_POOL_ID,
                    wallet.address,
                    wallet.address,
                    {
                        assets: [data.pool.tokens[0].address, data.pool.tokens[1].address],
                        maxAmountsIn: [data.usdcAmountInWei, data.thxAmountInWei],
                        userData: '0x',
                        fromInternalBalance: false,
                    },
                ]);
            } else {
                const [usdc, thx] = data.pool.tokens as unknown as {
                    address: string;
                }[];
                return data.pool.buildJoin(
                    wallet.address,
                    [usdc.address, thx.address],
                    [data.usdcAmountInWei, data.thxAmountInWei],
                    data.slippage,
                ) as { to: `0x${string}`; data: `0x${string}` };
            }
        },
        async createLiquidity(wallet: TWallet, data: TCreateLiquidityOptions) {
            const { sendTransaction, waitForTransactionReceipt, getBalance } = useWalletStore();
            const call = this.buildJoin(wallet, data);
            const hash = await sendTransaction(wallet.address, call.to, call.data, ChainId.Polygon, '1000000'); // TODO Using a fixed gas limit for now
            await waitForTransactionReceipt(hash);

            track('UserCreates', [
                useAccountStore().account?.sub,
                'liquidity',
                {
                    address: wallet?.address,
                    usdcAmountInWei: data.usdcAmountInWei,
                    thxAmountInWei: data.thxAmountInWei,
                    slippage: data.slippage,
                },
            ]);

            const { USDC, THX } = contractNetworks[this.chainId];

            await getBalance(USDC, this.chainId);
            await getBalance(THX, this.chainId);
        },
        async stake(wallet: TWallet, data: { amountInWei: string }) {
            const { getBalance, sendTransaction, encodeContractCall, waitForTransactionReceipt } = useWalletStore();
            const bptGaugeAddress = contractNetworks[this.chainId].BPTGauge;
            const call = encodeContractCall(contractNetworks[this.chainId].BPTGauge, abi.BPTGauge, 'deposit', [
                data.amountInWei,
            ]);

            // Sign and execute the transaction data
            const hash = await sendTransaction(wallet.address, call.to, call.data, this.chainId);
            await waitForTransactionReceipt(hash);

            track('UserCreates', [
                useAccountStore().account?.sub,
                'staked liquidity',
                { address: wallet?.address, amountInWei: data.amountInWei },
            ]);

            await getBalance(bptGaugeAddress, this.chainId);
            await useVeStore().getLocks(wallet);
        },
        async listPrices() {
            const { api } = useAccountStore();
            const pricing = await api.request.get('/v1/earn/prices');
            this.pricing = pricing;
        },
        async listMetrics(wallet?: TWallet) {
            const { api } = useAccountStore();
            const { apr, tvl, rewards, schedule } = await api.request.get('/v1/earn/metrics', {
                params: { walletId: wallet?._id, chainId: this.chainId },
            });
            this.apr = apr;
            this.tvl = tvl;
            this.rewards = rewards;
            this.schedule = schedule;
        },
    },
});

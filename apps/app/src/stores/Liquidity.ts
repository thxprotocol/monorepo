import poll from 'promise-poller';
import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { BALANCER_POOL_ID, contractNetworks } from '../config/constants';
import { WalletVariant } from '../types/enums/accountVariant';
import { BigNumber } from 'alchemy-sdk';
import { PoolWithMethods } from '@balancer-labs/sdk';
import { ChainId } from '@thxnetwork/common/enums';
import { track } from '@thxnetwork/common/mixpanel';

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
    actions: {
        async createLiquidity(wallet: TWallet, data: TCreateLiquidityOptions) {
            const map: { [variant: string]: (wallet: TWallet, data: TCreateLiquidityOptions) => Promise<void> } = {
                [WalletVariant.Safe]: this.createLiquiditySafe.bind(this),
                [WalletVariant.WalletConnect]: this.createLiquidityWalletConnect.bind(this),
            };

            return await map[wallet.variant](wallet, data);
        },
        async createLiquiditySafe(wallet: TWallet, data: TCreateLiquidityOptions) {
            const { api } = useAccountStore();
            const { confirmTransactions } = useWalletStore();
            const txs = await api.request.post('/v1/liquidity', { data, params: { walletId: wallet._id } });

            await confirmTransactions(txs);
        },
        buildJoin(wallet: TWallet, data: TCreateLiquidityOptions) {
            if (wallet.chainId === ChainId.Hardhat) {
                const { encodeContractCall } = useWalletStore();
                const abi = [
                    {
                        inputs: [
                            {
                                internalType: 'bytes32',
                                name: 'poolId',
                                type: 'bytes32',
                            },
                            {
                                internalType: 'address',
                                name: 'sender',
                                type: 'address',
                            },
                            {
                                internalType: 'address',
                                name: 'recipient',
                                type: 'address',
                            },
                            {
                                components: [
                                    {
                                        internalType: 'address[]',
                                        name: 'assets',
                                        type: 'address[]',
                                    },
                                    {
                                        internalType: 'uint256[]',
                                        name: 'maxAmountsIn',
                                        type: 'uint256[]',
                                    },
                                    {
                                        internalType: 'bytes',
                                        name: 'userData',
                                        type: 'bytes',
                                    },
                                    {
                                        internalType: 'bool',
                                        name: 'fromInternalBalance',
                                        type: 'bool',
                                    },
                                ],
                                internalType: 'struct BalancerVault.JoinPoolRequest',
                                name: 'request',
                                type: 'tuple',
                            },
                        ],
                        name: 'joinPool',
                        outputs: [],
                        stateMutability: 'nonpayable',
                        type: 'function',
                    },
                ];
                return encodeContractCall(contractNetworks[wallet.chainId].BalancerVault, abi, 'joinPool', [
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
        async createLiquidityWalletConnect(wallet: TWallet, data: TCreateLiquidityOptions) {
            const { sendTransaction } = useWalletStore();
            const call = this.buildJoin(wallet, data);
            await sendTransaction(wallet.address, call.to, call.data, '1000000'); // TODO Using a fixed gas limit for now
        },
        waitForLiquidity(wallet: TWallet, data: TCreateLiquidityOptions) {
            const { balances, getBalance } = useWalletStore();
            const { USDC, THX } = contractNetworks[wallet.chainId];
            const currentUSDCBalanceInWei = BigNumber.from(balances[USDC]);
            const currentTHXBalanceInWei = BigNumber.from(balances[THX]);

            const taskFn = async () => {
                await getBalance(USDC);
                await getBalance(THX);

                const usdcBalanceExpected = BigNumber.from(currentUSDCBalanceInWei).sub(data.usdcAmountInWei);
                const thxBalanceExpected = BigNumber.from(currentTHXBalanceInWei).sub(data.thxAmountInWei);
                const usdcBalance = useWalletStore().balances[USDC];
                const thxBalance = useWalletStore().balances[THX];
                const isDone = usdcBalanceExpected.eq(usdcBalance) && thxBalanceExpected.eq(thxBalance);

                if (isDone) {
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
                }

                return isDone ? Promise.resolve() : Promise.reject('Liquidity');
            };

            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async stake(wallet: TWallet, data: { amountInWei: string }) {
            const map: { [variant: string]: (wallet: TWallet, data: { amountInWei: string }) => Promise<void> } = {
                [WalletVariant.Safe]: this.stakeSafe.bind(this),
                [WalletVariant.WalletConnect]: this.stakeWalletConnect.bind(this),
            };

            return await map[wallet.variant](wallet, data);
        },
        async stakeSafe(wallet: TWallet, data: { amountInWei: string }) {
            const { api } = useAccountStore();
            const { confirmTransactions } = useWalletStore();
            const txs = await api.request.post('/v1/liquidity/stake', { data, params: { walletId: wallet._id } });

            await confirmTransactions(txs);
        },
        async stakeWalletConnect(wallet: TWallet, data: { amountInWei: string }) {
            const { sendTransaction, encodeContractCall } = useWalletStore();
            const abi = [
                {
                    stateMutability: 'nonpayable',
                    type: 'function',
                    name: 'deposit',
                    inputs: [
                        {
                            name: '_value',
                            type: 'uint256',
                        },
                    ],
                    outputs: [],
                },
            ];
            const call = encodeContractCall(contractNetworks[wallet.chainId].BPTGauge, abi, 'deposit', [
                data.amountInWei,
            ]);

            // Sign and execute the transaction data
            await sendTransaction(wallet.address, call.to, call.data);
        },
        async listPrices() {
            const { api } = useAccountStore();
            const pricing = await api.request.get('/v1/earn/prices');
            this.pricing = pricing;
        },
        async listMetrics(wallet?: TWallet) {
            const { api } = useAccountStore();
            const { apr, tvl, rewards, schedule } = await api.request.get('/v1/earn/metrics', {
                params: { walletId: wallet?._id },
            });
            this.apr = apr;
            this.tvl = tvl;
            this.rewards = rewards;
            this.schedule = schedule;
        },
        async waitForStake(wallet: TWallet, amountInWei: BigNumber) {
            const { balances, getBalance } = useWalletStore();
            const bptGaugeAddress = contractNetworks[wallet.chainId].BPTGauge;
            const oldBalanceInWei = BigNumber.from(balances[bptGaugeAddress]);
            const taskFn = async () => {
                await getBalance(bptGaugeAddress);

                const bptGaugeBalance = useWalletStore().balances[bptGaugeAddress];
                const bptGaugeBalanceExpected = amountInWei.add(oldBalanceInWei);
                const isDone = bptGaugeBalanceExpected.eq(bptGaugeBalance);

                if (isDone) {
                    track('UserCreates', [
                        useAccountStore().account?.sub,
                        'staked liquidity',
                        { address: wallet?.address, amountInWei: amountInWei.toString() },
                    ]);
                }

                return isDone ? Promise.resolve() : Promise.reject('Stake');
            };

            return poll({ taskFn, interval: 3000, retries: 20 });
        },
    },
});

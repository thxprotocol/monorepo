import poll from 'promise-poller';
import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { BALANCER_POOL_ID, contractNetworks } from '../config/constants';
import { WalletVariant } from '../types/enums/accountVariant';
import { BigNumber } from 'ethers';
import { PoolWithMethods } from '@balancer-labs/sdk';
import { ChainId } from '@thxnetwork/sdk';

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
            balancer: { min: 0, max: 0 },
            thx: { min: 0, max: 0 },
        },
        tvl: 0,
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

                return usdcBalanceExpected.eq(usdcBalance) && thxBalanceExpected.eq(thxBalance)
                    ? Promise.resolve()
                    : Promise.reject('Liquidity');
            };

            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async stake(data: { amountInWei: string }) {
            const { wallet } = useWalletStore();
            if (!wallet) return;

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
        async getSpotPrice() {
            const { api } = useAccountStore();

            api.request.get('/v1/prices/apr').then((data: { apr: TAPR; tvl: number }) => {
                this.apr = data.apr;
                this.tvl = data.tvl;
            });

            const pricing = await api.request.get('/v1/prices');
            this.pricing = pricing;
        },
        async waitForStake(amountInWei: BigNumber) {
            const { wallet, balances, getBalance } = useWalletStore();
            if (!wallet) return;

            const bptGaugeAddress = contractNetworks[wallet.chainId].BPTGauge;
            const oldBalanceInWei = BigNumber.from(balances[bptGaugeAddress]);
            const taskFn = async () => {
                await getBalance(bptGaugeAddress);

                const bptGaugeBalance = useWalletStore().balances[bptGaugeAddress];
                const bptGaugeBalanceExpected = amountInWei.add(oldBalanceInWei);

                return bptGaugeBalanceExpected.eq(bptGaugeBalance) ? Promise.resolve() : Promise.reject('Stake');
            };

            return poll({ taskFn, interval: 3000, retries: 20 });
        },
    },
});

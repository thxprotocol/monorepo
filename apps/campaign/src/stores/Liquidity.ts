import poll from 'promise-poller';
import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { contractNetworks } from '../config/constants';
import { fromWei } from 'web3-utils';
import { WalletVariant } from '../types/enums/accountVariant';

export const useLiquidityStore = defineStore('liquidity', {
    state: (): TLiquidityState => ({
        pricing: { 'THX': 0, 'USDC': 0, 'BAL': 0, '20USDC-80THX': 0 },
    }),
    actions: {
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
            const pricing = await api.request.get('/v1/liquidity/price');

            this.pricing = pricing;
        },
        async waitForStake(amountInWei: string) {
            const { wallet, balances, getBalance } = useWalletStore();
            if (!wallet) return;

            const bptGaugeAddress = contractNetworks[wallet.chainId].BPTGauge;
            const oldBalance = balances[bptGaugeAddress];
            const taskFn = async () => {
                await getBalance(bptGaugeAddress);
                return useWalletStore().balances[bptGaugeAddress] === Number(fromWei(amountInWei)) + Number(oldBalance)
                    ? Promise.resolve()
                    : Promise.reject('Stake');
            };

            return poll({ taskFn, interval: 3000, retries: 20 });
        },
    },
});

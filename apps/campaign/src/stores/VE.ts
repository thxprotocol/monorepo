import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { ChainId } from '@thxnetwork/sdk';
import { MODE } from '../config/secrets';
import { WalletVariant } from '../types/enums/accountVariant';
import { contractNetworks } from '../config/constants';
import poll from 'promise-poller';

export function getChainId() {
    return MODE !== 'production' ? ChainId.Hardhat : ChainId.Polygon;
}

export const useVeStore = defineStore('ve', {
    state: (): TVeState => ({
        lock: null,
    }),
    actions: {
        async getLocks() {
            const { api } = useAccountStore();
            const { wallet } = useWalletStore();

            // Remove lock info if selected wallet is null
            if (!wallet) {
                this.lock = null;
                return;
            }

            const locks = await api.request.get('/v1/ve', { params: { walletId: wallet._id } });
            this.lock = locks[0].end ? locks[0] : null;
        },
        async deposit({ lockEndTimestamp, amountInWei }: TRequestBodyDeposit) {
            const { wallet } = useWalletStore();
            if (!wallet) return;

            const map: { [variant: string]: (wallet: TWallet, data: TRequestBodyDeposit) => Promise<void> } = {
                [WalletVariant.Safe]: this.depositSafe.bind(this),
                [WalletVariant.WalletConnect]: this.depositWalletConnect.bind(this),
            };

            return await map[wallet.variant](wallet, { lockEndTimestamp, amountInWei });
        },
        async depositSafe(wallet: TWallet, data: TRequestBodyDeposit) {
            const { confirmTransactions } = useWalletStore();
            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/ve/deposit', {
                data,
                params: { walletId: wallet._id },
            });

            await confirmTransactions(txs);
        },
        async depositWalletConnect(wallet: TWallet, data: TRequestBodyDeposit) {
            const { sendTransaction, encodeContractCall } = useWalletStore();
            const abi = [
                {
                    stateMutability: 'nonpayable',
                    type: 'function',
                    name: 'create_lock',
                    inputs: [
                        {
                            name: '_value',
                            type: 'uint256',
                        },
                        {
                            name: '_unlock_time',
                            type: 'uint256',
                        },
                    ],
                    outputs: [],
                },
            ];
            const call = encodeContractCall(contractNetworks[wallet.chainId].VotingEscrow, abi, 'create_lock', [
                data.amountInWei,
                data.lockEndTimestamp,
            ]);

            // Sign and execute the transaction data
            await sendTransaction(wallet.address, call.to, call.data);
        },
        async withdraw(isEarlyAttempt: boolean) {
            const { wallet, confirmTransactions } = useWalletStore();
            if (!wallet || !this.lock) return;

            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/ve/withdraw', {
                data: { isEarlyAttempt: isEarlyAttempt },
                params: { walletId: wallet._id },
            });
            await confirmTransactions(txs);
        },
        waitForLock(amountInWei: number, lockEndTimestamp: number) {
            const getLatestLockAmount = () => (this.lock ? this.lock.amount : 0);
            const getLatestLockEnd = () => (this.lock ? this.lock.end : 0);
            const taskFn = async () => {
                await this.getLocks();
                return getLatestLockAmount() === amountInWei && getLatestLockEnd() === lockEndTimestamp
                    ? Promise.resolve()
                    : Promise.reject('Amount');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
    },
});

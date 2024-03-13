import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { ChainId } from '@thxnetwork/sdk';
import { MODE } from '../config/secrets';
import { WalletVariant } from '../types/enums/accountVariant';
import { contractNetworks } from '../config/constants';
import poll from 'promise-poller';
import { BigNumber } from 'ethers';

export function getChainId() {
    return MODE !== 'production' ? ChainId.Hardhat : ChainId.Polygon;
}

export const useVeStore = defineStore('ve', {
    state: (): TVeState => ({
        lock: { end: 0, amount: 0, now: 0 },
        balance: 0,
        rewards: [],
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
            const { amount, end, now, balance, rewards } = locks[0];
            this.lock = { amount, end, now };
            this.rewards = rewards;
            this.balance = balance;
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
            const isLocked = this.lock ? BigNumber.from(String(this.lock.amount)).gt(0) : false;

            // If there is a lock and amount is > 0
            if (isLocked && BigNumber.from(data.amountInWei).gt(0)) {
                await this.increaseAmount(wallet, data);
            }

            // If there a lock and endTimestamp is > lock.end
            if (isLocked && this.lock && data.lockEndTimestamp > Number(this.lock.end)) {
                await this.increasUnlockTime(wallet, data);
            }

            // If there is no lock create the lock
            if (!isLocked) {
                await this.createLock(wallet, data);
            }
        },
        async createLock(wallet: TWallet, data: TRequestBodyDeposit) {
            const { sendTransaction } = useWalletStore();
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
            const call = useWalletStore().encodeContractCall(
                contractNetworks[wallet.chainId].VotingEscrow,
                abi,
                'create_lock',
                [data.amountInWei, data.lockEndTimestamp],
            );

            await sendTransaction(wallet.address, call.to, call.data);
        },
        async increaseAmount(wallet: TWallet, data: TRequestBodyDeposit) {
            const { sendTransaction } = useWalletStore();
            const abi = [
                {
                    stateMutability: 'nonpayable',
                    type: 'function',
                    name: 'increase_amount',
                    inputs: [
                        {
                            name: '_value',
                            type: 'uint256',
                        },
                    ],
                    outputs: [],
                },
            ];
            const call = useWalletStore().encodeContractCall(
                contractNetworks[wallet.chainId].VotingEscrow,
                abi,
                'increase_amount',
                [data.amountInWei],
            );
            await sendTransaction(wallet.address, call.to, call.data);
        },
        async increasUnlockTime(wallet: TWallet, data: TRequestBodyDeposit) {
            const { sendTransaction } = useWalletStore();
            const abi = [
                {
                    stateMutability: 'nonpayable',
                    type: 'function',
                    name: 'increase_unlock_time',
                    inputs: [
                        {
                            name: '_unlock_time',
                            type: 'uint256',
                        },
                    ],
                    outputs: [],
                },
            ];
            const call = useWalletStore().encodeContractCall(
                contractNetworks[wallet.chainId].VotingEscrow,
                abi,
                'increase_unlock_time',
                [data.lockEndTimestamp],
            );
            await sendTransaction(wallet.address, call.to, call.data);
        },
        async withdraw(isEarlyAttempt: boolean) {
            const { wallet } = useWalletStore();
            if (!wallet) return;

            const map: { [variant: string]: (wallet: TWallet, isEarlyAttempt: boolean) => Promise<void> } = {
                [WalletVariant.Safe]: this.withdrawSafe.bind(this),
                [WalletVariant.WalletConnect]: this.withdrawWalletConnect.bind(this),
            };

            return await map[wallet.variant](wallet, isEarlyAttempt);
        },
        async withdrawSafe(wallet: TWallet, isEarlyAttempt: boolean) {
            const { confirmTransactions } = useWalletStore();
            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/ve/withdraw', {
                data: { isEarlyAttempt: isEarlyAttempt },
                params: { walletId: wallet._id },
            });

            await confirmTransactions(txs);
        },
        async withdrawWalletConnect(wallet: TWallet, isEarlyAttempt: boolean) {
            const { sendTransaction } = useWalletStore();
            const method = isEarlyAttempt ? 'withdraw_early' : 'withdraw';
            const abi = [
                {
                    stateMutability: 'nonpayable',
                    type: 'function',
                    name: method,
                    inputs: [],
                    outputs: [],
                },
            ];
            const call = useWalletStore().encodeContractCall(
                contractNetworks[wallet.chainId].VotingEscrow,
                abi,
                method,
                [],
            );
            await sendTransaction(wallet.address, call.to, call.data);
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

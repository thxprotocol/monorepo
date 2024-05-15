import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { ChainId } from '@thxnetwork/common/enums';
import { MODE } from '../config/secrets';
import { WalletVariant } from '../types/enums/accountVariant';
import { contractNetworks } from '../config/constants';
import { BigNumber } from 'ethers';
import poll, { CANCEL_TOKEN } from 'promise-poller';

export function getChainId() {
    return MODE !== 'production' ? ChainId.Hardhat : ChainId.Polygon;
}

export const useVeStore = defineStore('ve', {
    state: (): TVeState => ({
        lock: { end: 0, amount: '0' },
        now: Date.now(),
        balance: 0,
        rewards: [],
        isModalClaimTokensShown: false,
    }),
    actions: {
        reset() {
            this.lock = { end: 0, amount: '0' };
            this.now = Date.now();
            this.balance = 0;
            this.rewards = [];
        },
        async getLocks(wallet: TWallet) {
            const { api } = useAccountStore();
            const locks = await api.request.get('/v1/ve', { params: { walletId: wallet._id } });
            const { amount, end, now, balance, rewards } = locks[0];
            this.lock = { amount, end };
            this.now = now;
            this.rewards = rewards;
            this.balance = balance;
        },
        async deposit(wallet: TWallet, { lockEndTimestamp, amountInWei }: TRequestBodyDeposit) {
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
        async increaseAmount(wallet: TWallet, data: { amountInWei: string }) {
            const map: { [variant: string]: (wallet: TWallet, data: { amountInWei: string }) => Promise<void> } = {
                [WalletVariant.Safe]: this.increaseAmountSafe.bind(this),
                [WalletVariant.WalletConnect]: this.increaseAmountWalletConnect.bind(this),
            };
            return await map[wallet.variant](wallet, data);
        },
        async increaseAmountSafe(wallet: TWallet, data: { amountInWei: string }) {
            const { confirmTransactions } = useWalletStore();
            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/ve/increase', {
                data,
                params: { walletId: wallet._id },
            });

            await confirmTransactions(txs);
        },
        async increaseAmountWalletConnect(wallet: TWallet, data: { amountInWei: string }) {
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
        async waitForIncreaseAmount(wallet: TWallet, amountInWei: BigNumber) {
            const expectedAmount = BigNumber.from(this.lock.amount).add(amountInWei);
            const taskFn = async () => {
                await this.getLocks(wallet);
                return BigNumber.from(this.lock.amount).eq(expectedAmount)
                    ? Promise.resolve()
                    : Promise.reject('Increase amount');
            };
            return await poll({ taskFn, interval: 3000, retries: 20 });
        },
        async increasUnlockTime(wallet: TWallet, data: { lockEndTimestamp: number }) {
            const map: { [variant: string]: (wallet: TWallet, data: { lockEndTimestamp: number }) => Promise<void> } = {
                [WalletVariant.Safe]: this.increaseUnlockTimeSafe.bind(this),
                [WalletVariant.WalletConnect]: this.increaseUnlockTimeWalletConnect.bind(this),
            };

            return await map[wallet.variant](wallet, data);
        },
        async increaseUnlockTimeSafe(wallet: TWallet, data: { lockEndTimestamp: number }) {
            const { confirmTransactions } = useWalletStore();
            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/ve/increase', {
                data,
                params: { walletId: wallet._id },
            });

            await confirmTransactions(txs);
        },
        async increaseUnlockTimeWalletConnect(wallet: TWallet, data: { lockEndTimestamp: number }) {
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
        async waitForIncreaseUnlockTime(wallet: TWallet, timestamp: number) {
            const taskFn = async () => {
                await this.getLocks(wallet);
                return this.lock.end === timestamp * 1000 ? Promise.resolve() : Promise.reject('Increase lock end');
            };
            return await poll({ taskFn, interval: 3000, retries: 20 });
        },
        async claimTokens(wallet: TWallet) {
            const map: { [variant: string]: (wallet: TWallet) => Promise<void> } = {
                [WalletVariant.Safe]: this.claimTokenSafe.bind(this),
                [WalletVariant.WalletConnect]: this.claimTokenWalletConnect.bind(this),
            };

            return await map[wallet.variant](wallet);
        },
        async claimTokenSafe(wallet: TWallet) {
            const { confirmTransactions } = useWalletStore();
            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/ve/claim', {
                params: { walletId: wallet._id },
            });

            await confirmTransactions(txs);
        },
        async claimTokenWalletConnect(wallet: TWallet) {
            const { sendTransaction } = useWalletStore();
            const abi = [
                {
                    inputs: [
                        {
                            internalType: 'address',
                            name: 'user',
                            type: 'address',
                        },
                        {
                            internalType: 'contract IERC20[]',
                            name: 'tokens',
                            type: 'address[]',
                        },
                    ],
                    name: 'claimTokens',
                    outputs: [
                        {
                            internalType: 'uint256[]',
                            name: '',
                            type: 'uint256[]',
                        },
                    ],
                    stateMutability: 'nonpayable',
                    type: 'function',
                },
            ];

            const { RewardDistributor, BAL, BPT } = contractNetworks[wallet.chainId];
            const call = useWalletStore().encodeContractCall(RewardDistributor, abi, 'claimTokens', [
                wallet.address,
                [BAL, BPT],
            ]);
            await sendTransaction(wallet.address, call.to, call.data);
        },
        async withdraw(wallet: TWallet, isEarlyAttempt: boolean) {
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
        async waitForWithdrawal(wallet: TWallet) {
            const taskFn = async () => {
                await this.getLocks(wallet);
                return BigNumber.from(this.lock.amount).eq(0) ? Promise.resolve() : Promise.reject('Withdraw');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async waitForLock(wallet: TWallet, amountInWei: BigNumber, lockEndTimestamp: number) {
            const taskFn = async () => {
                await this.getLocks(wallet);
                return this.lock && this.lock.amount === amountInWei.toString() && this.lock.end === lockEndTimestamp
                    ? Promise.reject(CANCEL_TOKEN)
                    : Promise.reject('Ve amount');
            };
            return await poll({ taskFn, interval: 3000, retries: 20 });
        },
    },
});

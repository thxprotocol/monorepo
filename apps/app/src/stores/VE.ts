import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { contractNetworks } from '../config/constants';
import { track } from '@thxnetwork/common/mixpanel';
import { ChainId } from '@thxnetwork/common/enums';
import { abi } from '../utils/abi';

export const useVeStore = defineStore('ve', {
    state: (): TVeState => ({
        lock: { end: 0, amount: '0' },
        now: Date.now(),
        balance: 0,
        rewards: [],
        isAccepted: false,
        isModalClaimTokensShown: false,
    }),
    getters: {
        chainId() {
            const { chainId } = useWalletStore();
            return [ChainId.Polygon, ChainId.Hardhat].includes(chainId) ? chainId : ChainId.Polygon;
        },
    },
    actions: {
        reset() {
            this.lock = { end: 0, amount: '0' };
            this.now = Date.now();
            this.balance = 0;
            this.rewards = [];
        },
        async getLocks(wallet: TWallet) {
            const { api } = useAccountStore();
            const locks = await api.request.get('/v1/ve', { params: { walletId: wallet._id, chainId: this.chainId } });
            const { amount, end, now, balance, rewards } = locks[0];
            this.lock = { amount, end };
            this.now = now;
            this.rewards = rewards;
            this.balance = balance;
        },
        async deposit(wallet: TWallet, { lockEndTimestamp, amountInWei }: TRequestBodyDeposit) {
            const { sendTransaction, getBalance, waitForTransactionReceipt } = useWalletStore();
            const call = useWalletStore().encodeContractCall(
                contractNetworks[this.chainId].VotingEscrow,
                abi.VotingEscrow,
                'create_lock',
                [amountInWei, lockEndTimestamp],
            );

            const hash = await sendTransaction(wallet.address, call.to, call.data, this.chainId);
            await waitForTransactionReceipt(hash);

            track('UserCreates', [
                useAccountStore().account?.sub,
                'locked liquidity',
                { address: wallet?.address, ...this.lock },
            ]);

            const { BPTGauge } = contractNetworks[this.chainId];
            await getBalance(BPTGauge, this.chainId);
            await this.getLocks(wallet);
        },
        async increaseAmount(wallet: TWallet, data: { amountInWei: string }) {
            const { sendTransaction, waitForTransactionReceipt } = useWalletStore();
            const call = useWalletStore().encodeContractCall(
                contractNetworks[this.chainId].VotingEscrow,
                abi.VotingEscrow,
                'increase_amount',
                [data.amountInWei.toString()],
            );
            const hash = await sendTransaction(wallet.address, call.to, call.data, this.chainId);
            await waitForTransactionReceipt(hash);

            track('UserCreates', [
                useAccountStore().account?.sub,
                'increased lock amount',
                { address: wallet?.address, amountInWei: data.amountInWei },
            ]);

            await this.getLocks(wallet);
        },
        async increasUnlockTime(wallet: TWallet, data: { lockEndTimestamp: number }) {
            const { sendTransaction, waitForTransactionReceipt } = useWalletStore();
            const call = useWalletStore().encodeContractCall(
                contractNetworks[this.chainId].VotingEscrow,
                abi.VotingEscrow,
                'increase_unlock_time',
                [data.lockEndTimestamp],
            );

            const hash = await sendTransaction(wallet.address, call.to, call.data, this.chainId);
            await waitForTransactionReceipt(hash);

            await this.getLocks(wallet);
        },
        async claimTokens(wallet: TWallet) {
            const { getBalance, sendTransaction, waitForTransactionReceipt } = useWalletStore();
            const { RewardDistributor, BAL, BPT } = contractNetworks[this.chainId];
            const call = useWalletStore().encodeContractCall(RewardDistributor, abi.RewardDistributor, 'claimTokens', [
                wallet.address,
                [BAL, BPT],
            ]);
            const hash = await sendTransaction(wallet.address, call.to, call.data, this.chainId);
            await waitForTransactionReceipt(hash);

            await getBalance(BAL, this.chainId);
            await getBalance(BPT, this.chainId);
        },
        async withdraw(wallet: TWallet, isEarlyAttempt: boolean) {
            const { sendTransaction, waitForTransactionReceipt } = useWalletStore();
            const method = isEarlyAttempt ? 'withdraw_early' : 'withdraw';

            const call = useWalletStore().encodeContractCall(
                contractNetworks[this.chainId].VotingEscrow,
                abi.VotingEscrow,
                method,
                [],
            );
            const hash = await sendTransaction(wallet.address, call.to, call.data, this.chainId);
            await waitForTransactionReceipt(hash);

            track('UserCreates', [
                useAccountStore().account?.sub,
                'liquidity withdrawal',
                { address: wallet?.address },
            ]);

            await this.getLocks(wallet);
        },
    },
});

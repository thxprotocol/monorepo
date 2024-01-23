import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import poll from 'promise-poller';

type TVeState = {
    lock: { amount: number; end: number; now: number } | null;
};

type TRequestBodyDeposit = {
    lockEndTimestamp: number;
    amountInWei: string;
};

export const useVeStore = defineStore('ve', {
    state: (): TVeState => ({
        lock: null,
    }),
    actions: {
        async getLocks() {
            const { api } = useAccountStore();
            const locks = await api.request.get('/v1/ve');

            this.lock = locks[0];
        },
        async deposit({ lockEndTimestamp, amountInWei }: TRequestBodyDeposit) {
            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/ve/deposit', {
                data: {
                    amountInWei,
                    lockEndTimestamp,
                },
            });
            await useWalletStore().confirmTransactions(txs);
        },
        async withdraw(isEarlyAttempt: boolean) {
            if (!this.lock) return;
            const { api } = useAccountStore();
            const txs = await api.request.post('/v1/ve/withdraw', {
                data: {
                    isEarlyAttempt: isEarlyAttempt,
                },
            });
            await useWalletStore().confirmTransactions(txs);
        },
        waitForLock(amountInWei: string, lockEndTimestamp: number) {
            const getLatestLockAmount = () => (this.lock ? this.lock.amount : 0);
            const getLatestLockEnd = () => (this.lock ? this.lock.end : 0);
            const taskFn = async () => {
                await this.getLocks();
                console.log(getLatestLockAmount(), Number(amountInWei), getLatestLockEnd(), lockEndTimestamp);
                return getLatestLockAmount() === Number(amountInWei) && getLatestLockEnd() === lockEndTimestamp
                    ? Promise.resolve()
                    : Promise.reject('Amount');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
    },
});

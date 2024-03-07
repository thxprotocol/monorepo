import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';
import { ChainId } from '@thxnetwork/sdk';
import { MODE } from '../config/secrets';
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
            const locks = await api.request.get('/v1/ve');
            this.lock = locks[0].end ? locks[0] : null;
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

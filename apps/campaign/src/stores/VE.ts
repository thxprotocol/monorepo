import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';

type TVeState = {
    lock: { amount: string; endTime: number } | null;
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
            const tx = await api.request.post('/v1/ve/deposit', {
                data: {
                    amountInWei,
                    lockEndTimestamp,
                },
            });
            await useWalletStore().confirmTransaction(tx.safeTxHash);
        },
        async withdraw() {
            //
        },
    },
});

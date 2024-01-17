import { defineStore } from 'pinia';
import { useAccountStore } from './Account';

type TVeState = {
    balances: { usdc: number; thx: number; bpt: number };
};

type TDepositRequestBody = {
    lockEndTimestamp: string;
    amountInWei: string;
};

export const useVeStore = defineStore('ve', {
    state: (): TVeState => ({
        balances: {
            usdc: 0,
            thx: 0,
            bpt: 0,
        },
    }),
    actions: {
        async getBPTBalance() {
            const { api } = useAccountStore();
            const balanceInWei = await api.request.get('/v1/ve/bpt/balance');
            this.balances.bpt = Number(balanceInWei);
        },
        async deposit({ lockEndTimestamp, amountInWei }: TDepositRequestBody) {
            const { api } = useAccountStore();
            const tx = await api.request.post('/v1/ve/deposit', {
                data: {
                    amountInWei,
                    lockEndTimestamp,
                },
            });
            console.log({ tx });
        },
        async withdraw() {
            //
        },
    },
});

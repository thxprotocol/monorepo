import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';

export const useLiquidityStore = defineStore('liquidity', {
    state: (): TLiquidityState => ({
        //
    }),
    actions: {
        async stake(data: { amountInWei: string }) {
            const { api } = useAccountStore();
            const { wallet, confirmTransactions } = useWalletStore();
            if (!wallet) return;

            const txs = await api.request.post('/v1/liquidity/stake', { data, params: { walletId: wallet._id } });

            await confirmTransactions(txs);
        },
    },
});

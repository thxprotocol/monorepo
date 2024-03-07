import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { useWalletStore } from './Wallet';

export const useLiquidityStore = defineStore('liquidity', {
    state: (): TLiquidityState => ({
        pricing: { 'THX': 0, 'USDC': 0, '20USDC-80THX': 0 },
    }),
    actions: {
        async stake(data: { amountInWei: string }) {
            const { api } = useAccountStore();
            const { wallet, confirmTransactions } = useWalletStore();
            if (!wallet) return;

            const txs = await api.request.post('/v1/liquidity/stake', { data, params: { walletId: wallet._id } });

            await confirmTransactions(txs);
        },
        async getSpotPrice() {
            const { api } = useAccountStore();
            const pricing = await api.request.get('/v1/liquidity/price');
            this.pricing = pricing;
        },
    },
});

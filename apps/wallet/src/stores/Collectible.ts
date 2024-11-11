import { defineStore } from 'pinia';
import { useAuthStore, useSafeStore, useWalletStore } from '.';

export const useCollectibleStore = defineStore('collectible', {
    state: () => ({
        collectibles: [] as TERC721Token[],
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async list() {
            const { wallet, chainId } = useWalletStore();
            const collectibles = await this.request('/erc721/token', {
                isAuthenticated: true,
                params: { walletId: wallet?._id, chainId },
            });
            this.collectibles =
                collectibles && collectibles.length
                    ? collectibles.filter((c: TERC721Token) => c.nft && c.metadata)
                    : [];
        },
        async transfer(options: { to: string; erc721Id: string; erc721TokenId: string }) {
            const { wallet, chainId } = useWalletStore();
            const tx = await this.request('/erc721/transfer', {
                method: 'POST',
                isAuthenticated: true,
                body: { walletId: wallet?._id, chainId, ...options },
            });
            const { waitForTransaction } = useSafeStore();
            await waitForTransaction(tx);
        },
    },
});

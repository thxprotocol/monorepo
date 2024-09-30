import { defineStore } from 'pinia';
import { useWalletStore } from '.';
import { useAuthStore } from './Auth';

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
    },
});

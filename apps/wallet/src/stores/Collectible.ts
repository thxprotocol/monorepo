import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';
import { useWalletStore } from '.';

export const useCollectibleStore = defineStore('collectible', {
    state: () => ({
        collectibles: [] as TERC721Token[],
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async list(walletId: string) {
            const { chainId } = useWalletStore();
            this.collectibles = await this.request('/erc721/token', { params: { walletId, chainId } });
        },
    },
});

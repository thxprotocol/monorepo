import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';

export const useCollectibleStore = defineStore('collectible', {
    state: () => ({
        collectibles: [] as TERC721Token[],
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async list(walletId: string) {
            debugger;
            this.collectibles = await this.request('/erc721/token', { params: { walletId } });
        },
    },
});

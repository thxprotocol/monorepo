import { defineStore } from 'pinia';
import { useAccountStore } from './Account';

export const useWalletStore = defineStore('wallet', {
    state: (): TWalletState => ({
        erc20: [],
        erc721: [],
    }),
    actions: {
        async list() {
            const { api } = useAccountStore();
            this.erc20 = (await api.erc20.list()).map((t: any) => {
                return { ...t, component: 'BaseCardERC20' };
            });
            this.erc721 = (await api.erc721.list()).map((t: any) => {
                return { ...t, component: 'BaseCardERC721' };
            });
            console.log(this.erc721);
        },
    },
});

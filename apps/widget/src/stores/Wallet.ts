import { defineStore } from 'pinia';
import { thx } from '../utils/thx';

export const useWalletStore = defineStore('wallet', {
    state: (): TWalletState => ({
        erc20: [],
        erc721: [],
    }),
    actions: {
        async list() {
            this.erc20 = (await thx.erc20.list()).map((t: any) => {
                return { ...t, component: 'BaseCardERC20' };
            });
            this.erc721 = (await thx.erc721.list()).map((t: any) => {
                return { ...t, component: 'BaseCardERC721' };
            });
            console.log(this.erc721);
        },
    },
});

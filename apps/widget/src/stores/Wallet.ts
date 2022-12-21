import { defineStore } from 'pinia';
import { useAccountStore } from './Account';

export const useWalletStore = defineStore('wallet', {
    state: (): TWalletState => ({
        wallet: null,
        erc20: [],
        erc721: [],
    }),
    actions: {
        async getWallet() {
            const { api, getConfig, account, poolId } = useAccountStore();
            if (!account) return;

            const wallets = await api.walletManager.list(getConfig(poolId).chainId, account.sub);
            this.wallet = wallets[0];
        },
        async list() {
            const { api } = useAccountStore();
            this.erc20 = (await api.erc20.list()).map((t: any) => {
                return { ...t, component: 'BaseCardERC20' };
            });
            this.erc721 = (await api.erc721.list()).map((t: any) => {
                return { ...t, component: 'BaseCardERC721' };
            });
        },
    },
});

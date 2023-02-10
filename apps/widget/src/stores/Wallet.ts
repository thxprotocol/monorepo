import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';

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
            const { api, getConfig, poolId } = useAccountStore();
            const options = { chainId: getConfig(poolId).chainId };
            this.erc20 = (await api.erc20.list(options)).map((t: any) => {
                return { ...t, component: 'BaseCardERC20' };
            });
            this.erc721 = (await api.erc721.list(options)).map((t: any) => {
                return { ...t, component: 'BaseCardERC721' };
            });
        },
        async transfer(config: TERC20TransferConfig) {
            const { api, account } = useAccountStore();
            await api.erc20.transfer(config);
            track('UserCreates', [account?.sub, 'erc20 transfer']);
        },
        async upgrade() {
            const { api, account } = useAccountStore();
            await api.walletManager.upgrade(this.wallet?._id);
            track('UserCreates', [account?.sub, 'wallet upgrade']);
        },
    },
});

import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';

export const useWalletStore = defineStore('wallet', {
    state: (): TWalletState => ({
        wallet: null,
        erc20: [],
        erc721: [],
        erc1155: [],
        shopifyDiscountCode: [],
    }),
    actions: {
        async getWallet() {
            const { api, getConfig, account, poolId } = useAccountStore();
            if (!account) return;

            const wallets = await api.walletManager.list(getConfig(poolId).chainId, account.sub);
            this.wallet = wallets[0];
        },
        async getERC721Token({ _id }: TERC721Token) {
            const { api } = useAccountStore();
            const token = await api.erc721.get(_id);
            const index = this.erc721.findIndex((t) => t._id === token._id);

            this.erc721[index] = { ...token, component: 'BaseCardERC721' };
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
            this.erc1155 = (await api.erc1155.list(options)).map((t: any) => {
                return { ...t, component: 'BaseCardERC721' };
            });
            this.shopifyDiscountCode = (await api.perksManager.shopify.discountCodes()).map((t: any) => {
                return { ...t, component: 'BaseCardShopifyDiscountCode' };
            });
        },
        async transferERC20(config: TERC20TransferConfig) {
            const { api, account } = useAccountStore();
            await api.erc20.transfer(config);
            track('UserCreates', [account?.sub, 'erc20 transfer']);
        },
        async transferERC721(config: TERC721TransferConfig) {
            const { api, account } = useAccountStore();
            await api.erc721.transfer(config);
            track('UserCreates', [account?.sub, 'erc721 transfer']);
        },
        async upgrade() {
            const { api, account } = useAccountStore();
            await api.walletManager.upgrade(this.wallet?._id);
            track('UserCreates', [account?.sub, 'wallet upgrade']);
        },
    },
});

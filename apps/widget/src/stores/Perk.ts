import { defineStore } from 'pinia';
import { toNumber } from '../utils/rewards';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { parseUnitAmount } from '../utils/price';

export const usePerkStore = defineStore('perks', {
    state: (): TPerkState => ({
        perks: [],
    }),
    actions: {
        updateSupply: function (uuid: string) {
            const index = this.perks.findIndex((perk) => perk.uuid === uuid);
            this.perks[index].progress.count = this.perks[index].progress.count + 1;
        },
        createERC20Redemption: async function (uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            const { error } = await api.perksManager.erc20.redemption.post(uuid);
            if (error) throw error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'coin perk payment', { poolId, origin: getConfig(poolId).origin }]);
        },
        createERC721Redemption: async function (uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            const { error } = await api.perksManager.erc721.redemption.post(uuid);
            if (error) throw error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'nft perk redemption', { poolId, origin: getConfig(poolId).origin }]);
        },
        createERC721Payment: async function (uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            const r = await api.perksManager.erc721.payment.post(uuid);
            if (r.error) throw r.error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'nft perk payment', { poolId, origin: getConfig(poolId).origin }]);

            return r;
        },
        createShopifyRedemption: async function (uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            const { error } = await api.perksManager.shopify.redemption.post(uuid);
            if (error) throw error;

            this.updateSupply(uuid);

            track('UserCreates', [
                account?.sub,
                'shopify perk redemption',
                { poolId, origin: getConfig(poolId).origin },
            ]);
        },
        async getERC20Perk(uuid: string) {
            const { api } = useAccountStore();
            await api.perksManager.erc20.get(uuid);
        },
        async getERC721Perk(uuid: string) {
            const { api } = useAccountStore();
            await api.perksManager.erc721.get(uuid);
        },
        async getShopifyPerk(uuid: string) {
            const { api } = useAccountStore();
            await api.perksManager.shopify.get(uuid);
        },
        async list() {
            const { api } = useAccountStore();
            const { erc20Perks, erc721Perks, shopifyPerks } = await api.perksManager.list();

            this.perks = [
                ...(erc20Perks
                    ? Object.values(erc20Perks).map((r: any) => {
                          r.component = 'BaseCardPerkERC20';
                          return r;
                      })
                    : []),
                ...(erc721Perks
                    ? Object.values(erc721Perks).map((r: any) => {
                          r.component = 'BaseCardPerkERC721';
                          r.price = parseUnitAmount(r.price);
                          return r;
                      })
                    : []),
                ...(shopifyPerks
                    ? Object.values(shopifyPerks).map((r: any) => {
                          r.component = 'BaseCardPerkShopify';
                          r.price = parseUnitAmount(r.price);
                          return r;
                      })
                    : []),
            ]
                .sort((a: any, b: any) => toNumber(b.createdAt) - toNumber(a.createdAt))
                .sort((a: any, b: any) => toNumber(b.isPromoted) - toNumber(a.isPromoted));
        },
    },
});

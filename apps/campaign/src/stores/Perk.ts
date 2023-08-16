import { defineStore } from 'pinia';
import { toNumber } from '../utils/quests';
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
            const { error } = await api.rewards.erc20.redemption.post(uuid);
            if (error) throw error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'coin reward payment', { poolId, origin: getConfig(poolId).origin }]);
        },
        createERC721Redemption: async function (uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            const { error } = await api.rewards.erc721.redemption.post(uuid);
            if (error) throw error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'nft reward redemption', { poolId, origin: getConfig(poolId).origin }]);
        },
        createERC721Payment: async function (uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            const r = await api.rewards.erc721.payment.post(uuid);
            if (r.error) throw r.error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'nft reward payment', { poolId, origin: getConfig(poolId).origin }]);

            return r;
        },
        createCustomRedemption: async function (uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            const r = await api.rewards.custom.redemption.post(uuid);
            if (r.error) throw r.error;

            this.updateSupply(uuid);

            track('UserCreates', [
                account?.sub,
                'custom reward redemption',
                { poolId, origin: getConfig(poolId).origin },
            ]);

            return r;
        },
        async getERC20Perk(uuid: string) {
            const { api } = useAccountStore();
            await api.rewards.erc20.get(uuid);
        },
        async getERC721Perk(uuid: string) {
            const { api } = useAccountStore();
            await api.rewards.erc721.get(uuid);
        },
        async list() {
            const { api } = useAccountStore();
            const { erc20Perks, erc721Perks, customRewards } = await api.rewards.list();

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
                ...(customRewards
                    ? Object.values(customRewards).map((r: any) => {
                          r.component = 'BaseCardPerkCustom';
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

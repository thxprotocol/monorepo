import { defineStore } from 'pinia';
import { toNumber } from '../utils/quests';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { parseUnitAmount } from '../utils/price';

export const usePerkStore = defineStore('perks', {
    state: (): TPerkState => ({
        rewards: [],
    }),
    actions: {
        updateSupply: function (uuid: string) {
            const index = this.rewards.findIndex((reward) => reward.uuid === uuid);
            this.rewards[index].progress.count = this.rewards[index].progress.count + 1;
        },
        createERC20Redemption: async function (uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const { error } = await api.rewards.coin.redemption.post(uuid);
            if (error) throw error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'coin reward payment', { poolId, origin: config.origin }]);
        },
        createERC721Redemption: async function (uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const { error } = await api.rewards.nft.redemption.post(uuid);
            if (error) throw error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'nft reward redemption', { poolId, origin: config.origin }]);
        },
        createERC721Payment: async function (uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.rewards.nft.payment.post(uuid);
            if (r.error) throw r.error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'nft reward payment', { poolId, origin: config.origin }]);

            return r;
        },
        createCustomRedemption: async function (uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.rewards.custom.redemption.post(uuid);
            if (r.error) throw r.error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'custom reward redemption', { poolId, origin: config.origin }]);

            return r;
        },
        createCouponRedemption: async function (uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.rewards.coupon.redemption.post(uuid);
            if (r.error) throw r.error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'coupon reward redemption', { poolId, origin: config.origin }]);

            return r;
        },
        createDiscordRoleRedemption: async function (uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.request.post(`/v1/rewards/discord-role/${uuid}/redemption`);
            if (r.error) throw r.error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'discord role reward redemption', { poolId, origin: config.origin }]);

            return r;
        },
        async list() {
            const { api } = useAccountStore();
            const { coin, nft, custom, coupon, discordRole } = await api.rewards.list();

            this.rewards = [
                ...(coin
                    ? Object.values(coin).map((r: any) => {
                          r.component = 'BaseCardRewardERC20';
                          return r;
                      })
                    : []),
                ...(nft
                    ? Object.values(nft).map((r: any) => {
                          r.component = 'BaseCardRewardERC721';
                          r.price = parseUnitAmount(r.price);
                          return r;
                      })
                    : []),
                ...(custom
                    ? Object.values(custom).map((r: any) => {
                          r.component = 'BaseCardRewardCustom';
                          r.price = parseUnitAmount(r.price);
                          return r;
                      })
                    : []),
                ...(coupon
                    ? Object.values(coupon).map((r: any) => {
                          r.component = 'BaseCardRewardCoupon';
                          r.price = parseUnitAmount(r.price);
                          return r;
                      })
                    : []),
                ...(coupon
                    ? Object.values(discordRole).map((r: any) => {
                          r.component = 'BaseCardRewardDiscordRole';
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

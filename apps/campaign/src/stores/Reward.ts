import { defineStore } from 'pinia';
import { toNumber } from '../utils/quests';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { parseUnitAmount } from '../utils/price';

export const useRewardStore = defineStore('reward', {
    state: (): TRewardState => ({
        rewards: [],
        isLoading: true,
    }),
    actions: {
        updateSupply: function (id: string) {
            const index = this.rewards.findIndex((reward) => reward._id === id);
            this.rewards[index].progress.count = this.rewards[index].progress.count + 1;
        },
        createERC20Redemption: async function (id: string, wallet: TWallet) {
            const { api, account, poolId, config } = useAccountStore();
            console.log(id, wallet._id);
            const r = await api.request.post(`/v1/rewards/coin/${id}/payments`, {
                data: { walletId: wallet._id },
            });
            if (r.error) throw r.error;

            this.updateSupply(id);

            track('UserCreates', [account?.sub, 'coin reward payment', { poolId, origin: config.origin }]);
        },
        createERC721Redemption: async function (id: string, wallet: TWallet) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.request.post(`/v1/rewards/nft/${id}/payments`, {
                data: { walletId: wallet._id },
            });
            if (r.error) throw r.error;

            this.updateSupply(id);

            track('UserCreates', [account?.sub, 'nft reward redemption', { poolId, origin: config.origin }]);
        },
        createCustomRedemption: async function (id: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.request.post(`/v1/rewards/custom/${id}/oayments`);
            if (r.error) throw r.error;

            this.updateSupply(id);

            track('UserCreates', [account?.sub, 'custom reward redemption', { poolId, origin: config.origin }]);
        },
        createCouponRedemption: async function (uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.rewards.coupon.redemption.post(uuid);
            if (r.error) throw r.error;

            this.updateSupply(uuid);

            track('UserCreates', [account?.sub, 'coupon reward redemption', { poolId, origin: config.origin }]);
        },
        createDiscordRoleRedemption: async function (id: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.request.post(`/v1/rewards/discord-role/${id}/payments`);
            if (r.error) throw r.error;

            this.updateSupply(id);

            track('UserCreates', [account?.sub, 'discord role reward redemption', { poolId, origin: config.origin }]);
        },
        async list() {
            const { api } = useAccountStore();
            this.isLoading = true;

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
            this.isLoading = false;
        },
    },
});

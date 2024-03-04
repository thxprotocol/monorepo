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
        // createERC20Redemption: async function (id: string, wallet: TWallet) {
        //     const { api, account, poolId, config } = useAccountStore();
        //     const r = await api.request.post(`/v1/rewards/coin/${id}/payments`, {
        //         data: { walletId: wallet._id },
        //     });
        //     if (r.error) throw r.error;

        //     this.updateSupply(id);

        //     track('UserCreates', [account?.sub, 'coin reward payment', { poolId, origin: config.origin }]);
        // },
        // createERC721Redemption: async function (id: string, wallet: TWallet) {
        //     const { api, account, poolId, config } = useAccountStore();
        //     const r = await api.request.post(`/v1/rewards/nft/${id}/payments`, {
        //         data: { walletId: wallet._id },
        //     });
        //     if (r.error) throw r.error;

        //     this.updateSupply(id);

        //     track('UserCreates', [account?.sub, 'nft reward redemption', { poolId, origin: config.origin }]);
        // },
        // createCustomRedemption: async function (id: string) {
        //     const { api, account, poolId, config } = useAccountStore();
        //     const r = await api.request.post(`/v1/rewards/custom/${id}/oayments`);
        //     if (r.error) throw r.error;

        //     this.updateSupply(id);

        //     track('UserCreates', [account?.sub, 'custom reward redemption', { poolId, origin: config.origin }]);
        // },
        // createCouponRedemption: async function (id: string) {
        //     const { api, account, poolId, config } = useAccountStore();
        //     const r = await api.request.post(`/v1/rewards/coupon/${id}/payments`);
        //     if (r.error) throw r.error;

        //     this.updateSupply(id);

        //     track('UserCreates', [account?.sub, `${variant} reward redemption`, { poolId, origin: config.origin }]);
        // },
        // createDiscordRoleRedemption: async function (id: string) {
        //     const { api, account, poolId, config } = useAccountStore();
        //     const r = await api.request.post(`/v1/rewards/discord-role/${id}/payments`);
        //     if (r.error) throw r.error;

        //     this.updateSupply(id);

        //     track('UserCreates', [account?.sub, 'discord role reward redemption', { poolId, origin: config.origin }]);
        // },
        async createPayment(variant: RewardVariant, id: string, wallet?: TWallet) {
            const { api, account, poolId, config } = useAccountStore();
            const { error } = await api.request.post(`/v1/rewards/${variant}/${id}/payments`, {
                data: { walletId: wallet?._id },
            });
            if (error) throw error;

            this.updateSupply(id);

            track('UserCreates', [account?.sub, `${variant} reward redemption`, { poolId, origin: config.origin }]);
        },
        async list() {
            const { api } = useAccountStore();
            this.isLoading = true;

            const { coin, nft, custom, coupon, discordRole } = await api.rewards.list();
            this.rewards = [...coin, ...nft, ...custom, ...coupon, ...discordRole]
                .sort((a: any, b: any) => toNumber(b.createdAt) - toNumber(a.createdAt))
                .sort((a: any, b: any) => toNumber(b.isPromoted) - toNumber(a.isPromoted));
            this.isLoading = false;
        },
    },
});

import { defineStore } from 'pinia';
import { toNumber } from '../utils/quests';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { RewardVariant } from '../types/enums/rewards';

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
        async createPayment(variant: RewardVariant, id: string, wallet?: TWallet) {
            await useAccountStore().api.request.post(`/v1/rewards/${variant}/${id}/payments`, {
                data: { walletId: wallet?._id },
            });
            this.updateSupply(id);
            this.trackEvent(variant);
        },
        trackEvent(variant: RewardVariant) {
            const { account, poolId } = useAccountStore();
            const eventMap = {
                [RewardVariant.Coin]: 'coin reward payment',
                [RewardVariant.NFT]: 'nft reward payment',
                [RewardVariant.Coupon]: 'coupon reward redemption',
                [RewardVariant.Custom]: 'custom reward redemption',
                [RewardVariant.DiscordRole]: 'discord role reward redemption',
            };
            track('UserCreates', [account?.sub, eventMap[variant], { poolId }]);
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

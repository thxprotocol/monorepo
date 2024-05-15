import { defineStore } from 'pinia';
import { track } from '@thxnetwork/common/lib/mixpanel';
import { toNumber } from '../utils/quests';
import { useAccountStore } from './Account';
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
        trackEvent(variant: RewardVariant) {
            const { account, poolId } = useAccountStore();
            const eventMap = {
                [RewardVariant.Coin]: 'coin reward payment',
                [RewardVariant.NFT]: 'nft reward payment',
                [RewardVariant.Coupon]: 'coupon reward redemption',
                [RewardVariant.Custom]: 'custom reward redemption',
                [RewardVariant.DiscordRole]: 'discord role reward redemption',
                [RewardVariant.Galachain]: 'galachain reward redemption',
            };
            track('UserCreates', [account?.sub, eventMap[variant], { poolId }]);
        },
        async createPayment(variant: RewardVariant, id: string, wallet: TWallet | null) {
            const { api, waitForJob } = useAccountStore();
            const { jobId } = await api.request.post(`/v1/rewards/${variant}/${id}/payments`, {
                data: { walletId: wallet?._id },
            });

            // Wait for the quest entry job to complete
            await waitForJob(jobId);

            // Update local state
            this.updateSupply(id);
            this.trackEvent(variant);
        },
        async list() {
            const { api } = useAccountStore();
            this.isLoading = true;

            const { coin, nft, custom, coupon, discordRole, galachain } = await api.rewards.list();
            this.rewards = [...coin, ...nft, ...custom, ...coupon, ...discordRole, ...galachain]
                .sort((a: any, b: any) => toNumber(b.createdAt) - toNumber(a.createdAt))
                .sort((a: any, b: any) => toNumber(b.isPromoted) - toNumber(a.isPromoted));
            this.isLoading = false;
        },
    },
});

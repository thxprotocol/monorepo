import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { RewardVariant } from '../types/enums/rewards';

export const useRewardStore = defineStore('rewards', {
    state: (): TRewardState => ({
        rewards: [],
    }),
    actions: {
        async claimConditionalReward(id: string) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const claim = await api.rewardsManager.points.claim(id);
            if (claim.error) {
                throw claim.error;
            } else {
                track('UserCreates', [
                    account?.sub,
                    'conditional reward claim',
                    { poolId, origin: getConfig(poolId).origin },
                ]);

                getBalance();

                const index = this.rewards.findIndex((r) => r._id === id);
                this.rewards[index].isClaimed = true;
            }
        },
        async claimMilestoneReward(reward: TMilestoneReward) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const pendingClaims = reward.claims.filter((c) => !c.isClaimed);
            if (!pendingClaims.length) return;

            const uuid = pendingClaims[0].uuid;
            const claim = await api.rewardsManager.milestones.claim(uuid);

            if (claim.error) {
                throw claim.error;
            } else {
                track('UserCreates', [
                    account?.sub,
                    'milestone reward claim',
                    { poolId, origin: getConfig(poolId).origin },
                ]);

                getBalance();

                this.list();
            }
        },
        async claimDailyReward(reward: TDailyReward) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const claim = await api.rewardsManager.daily.claim(reward._id);

            if (claim.error) {
                throw claim.error;
            } else {
                track('UserCreates', [
                    account?.sub,
                    'daily reward claim',
                    { poolId, origin: getConfig(poolId).origin },
                ]);

                getBalance();

                this.list();
            }
        },

        async list() {
            const { api } = useAccountStore();
            const { referralRewards, pointRewards, milestoneRewards, dailyRewards } = await api.rewardsManager.list();

            const dailyRewardsArray = Object.values(dailyRewards);
            const dailyRewardsList = dailyRewardsArray.map((a: any) => {
                a.variant = RewardVariant.Daily;
                return a;
            });

            const referralRewardsList = Object.values(referralRewards).map((r: any) => {
                r.variant = RewardVariant.Referral;
                return r;
            });

            const pointRewardsArray = Object.values(pointRewards);
            const pointRewardsList = pointRewardsArray.map((a: any): TPointReward => {
                a.contentMetadata = a.contentMetadata && JSON.parse(a.contentMetadata);
                a.variant = RewardVariant.Conditional;
                return a;
            });

            const milestoneRewardsArray = Object.values(milestoneRewards);
            const milestoneRewardsList = milestoneRewardsArray.map((a: any): TMilestoneReward => {
                a.variant = RewardVariant.Milestone;
                return a;
            });

            this.rewards = [...milestoneRewardsList, ...pointRewardsList, ...dailyRewardsList, ...referralRewardsList];
        },
    },
});

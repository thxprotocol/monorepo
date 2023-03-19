import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';

export const useRewardStore = defineStore('rewards', {
    state: (): TRewardState => ({
        rewards: [],
    }),
    getters: {
        dailyRewards: (state: TRewardState) => state.rewards.filter((r) => r.component === 'BaseCardRewardDaily'),
        referralRewards: (state: TRewardState) => state.rewards.filter((r) => r.component === 'BaseCardRewardReferral'),
        conditionalRewards: (state: TRewardState) =>
            state.rewards.filter((r) => r.component === 'BaseCardRewardPoints'),
        milestoneRewards: (state: TRewardState) =>
            state.rewards.filter((r) => r.component === 'BaseCardRewardMilestone'),
    },
    actions: {
        async claimConditionalReward(uuid: string) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const claim = await api.rewardsManager.points.claim(uuid);
            if (claim.error) {
                throw claim.error;
            } else {
                track('UserCreates', [
                    account?.sub,
                    'conditional reward claim',
                    { poolId, origin: getConfig(poolId).origin },
                ]);

                getBalance();

                const index = this.rewards.findIndex((r) => r.uuid === uuid);
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

                const index = this.rewards.findIndex((r: TMilestoneReward) => r.uuid === reward.uuid);
                const claimIndex = this.rewards[index].claims.findIndex((c: TMilestoneRewardClaim) => c.uuid === uuid);

                this.rewards[index].claims[claimIndex] = claim;
            }
        },
        async claimDailyReward(reward: TDailyReward) {
            const { api, account, getBalance, poolId, getConfig } = useAccountStore();
            const claim = await api.rewardsManager.daily.claim({ uuid: reward.uuid, sub: account?.sub });

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
            const dailyRewardsList = Object.values(dailyRewards).map((r: any) => {
                r.component = 'BaseCardRewardDaily';
                return r;
            });

            const referralRewardsList = Object.values(referralRewards).map((r: any) => {
                r.component = 'BaseCardRewardReferral';
                return r;
            });

            const milestoneRewardsList = Object.values(milestoneRewards).map((r: any) => {
                r.component = 'BaseCardRewardMilestone';
                return r;
            });

            const pointRewardsList = await Promise.all(
                Object.values(pointRewards).map(async (r: any) => {
                    r.component = 'BaseCardRewardPoints';
                    return r;
                }),
            );

            this.rewards = [...dailyRewardsList, ...referralRewardsList, ...milestoneRewardsList, ...pointRewardsList];
        },
    },
});

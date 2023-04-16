import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { sortDailyRewards, sortConditionalRewards, sortMilestoneRewards } from '../utils/sort';

export const useRewardStore = defineStore('rewards', {
    state: (): TRewardState => ({
        rewards: [],
    }),
    getters: {
        all: (state: TRewardState) =>
            state.rewards.sort((a: any, b: any): any => {
                switch (a.component) {
                    case 'BaseCardRewardDaily':
                        return sortDailyRewards(a, b);
                    case 'BaseCardRewardReferral':
                        return -1;
                    case 'BaseCardRewardPoints':
                        return sortConditionalRewards(a, b);
                    case 'BaseCardRewardMilestone':
                        return sortMilestoneRewards(a, b);
                    default:
                        return 0;
                }
            }),
        dailyRewards: (state: TRewardState) =>
            state.rewards.filter((r) => r.component === 'BaseCardRewardDaily').sort(sortDailyRewards),
        referralRewards: (state: TRewardState) => state.rewards.filter((r) => r.component === 'BaseCardRewardReferral'),
        conditionalRewards: (state: TRewardState) =>
            state.rewards.filter((r) => r.component === 'BaseCardRewardPoints').sort(sortConditionalRewards),
        milestoneRewards: (state: TRewardState) =>
            state.rewards.filter((r) => r.component === 'BaseCardRewardMilestone').sort(sortMilestoneRewards),
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

            const dailyRewardsArray = Object.values(dailyRewards);
            const dailyRewardsList = dailyRewardsArray.map((a: any) => {
                a.component = 'BaseCardRewardDaily';
                return a;
            });

            const referralRewardsList = Object.values(referralRewards).map((r: any) => {
                r.component = 'BaseCardRewardReferral';
                return r;
            });

            const pointRewardsArray = Object.values(pointRewards);
            const pointRewardsList = pointRewardsArray.map((a: any): TPointReward => {
                a.component = 'BaseCardRewardPoints';
                a.contentMetadata = a.contentMetadata && JSON.parse(a.contentMetadata);
                return a;
            });

            const milestoneRewardsArray = Object.values(milestoneRewards);
            const milestoneRewardsList = milestoneRewardsArray.map((a: any): TMilestoneReward => {
                a.component = 'BaseCardRewardMilestone';
                return a;
            });

            this.rewards = [...milestoneRewardsList, ...pointRewardsList, ...dailyRewardsList, ...referralRewardsList];
        },
    },
});

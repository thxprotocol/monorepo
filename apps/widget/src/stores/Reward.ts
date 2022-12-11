import { defineStore } from 'pinia';
import { useAccountStore } from './Account';

export const useRewardStore = defineStore('rewards', {
    state: (): TRewardState => ({
        rewards: [],
    }),
    actions: {
        async claim(uuid: string) {
            const { api, getBalance } = useAccountStore();
            const claim = await api.rewardsManager.claimPointsReward(uuid);
            if (claim.error) {
                throw claim.error;
            } else {
                getBalance();
                const index = this.rewards.findIndex((r) => r.uuid === uuid);
                this.rewards[index].isClaimed = true;
            }
        },
        async getPointReward(id: string) {
            const { api } = useAccountStore();
            const results = await api.pointRewardManager.get(id);
            const index = this.rewards.findIndex((r: any) => r._id === id);
            this.rewards[index] = { ...this.rewards[index], ...results };
        },
        async list() {
            const { api } = useAccountStore();
            const { referralRewards, pointRewards } = await api.rewardsManager.list();

            this.rewards = [
                ...(referralRewards
                    ? Object.values(referralRewards).map((r: any) => {
                          r.component = 'BaseCardRewardReferral';
                          return r;
                      })
                    : []),
                ...(pointRewards
                    ? Object.values(pointRewards).map((r: any) => {
                          r.component = 'BaseCardRewardPoints';
                          return r;
                      })
                    : []),
            ];
        },
    },
});

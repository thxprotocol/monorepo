import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '../utils/mixpanel';

export const useRewardStore = defineStore('rewards', {
    state: (): TRewardState => ({
        rewards: [],
    }),
    actions: {
        async claim(uuid: string) {
            const { api, account, getBalance } = useAccountStore();
            const claim = await api.rewardsManager.points.claim(uuid);
            if (claim.error) {
                throw claim.error;
            } else {
                track.UserCreates(account?.sub, 'conditional reward claim');

                getBalance();
                const index = this.rewards.findIndex((r) => r.uuid === uuid);
                this.rewards[index].isClaimed = true;
            }
        },
        async list() {
            const { api, isAuthenticated } = useAccountStore();
            const { referralRewards, pointRewards } = await api.rewardsManager.list();
            const referralRewardsList = Object.values(referralRewards).map((r: any) => {
                r.component = 'BaseCardRewardReferral';
                return r;
            });
            const pointRewardsList = await Promise.all(
                Object.values(pointRewards).map(async (r: any) => {
                    r.component = 'BaseCardRewardPoints';
                    if (!isAuthenticated) return r;
                    const pointReward = await api.pointRewardManager.get(r._id);
                    return { ...r, ...pointReward };
                }),
            );

            this.rewards = [...referralRewardsList, ...pointRewardsList];
        },
    },
});

import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';
import { thx } from '../utils/thx';
import { useAccountStore } from './Account';

export const useRewardStore = defineStore('rewards', {
    state: (): TRewardState => ({
        erc20s: [
            {
                balance: 500,
                symbol: 'TRY',
                name: 'TryHards',
                logoImg: `https://avatars.dicebear.com/api/identicon/tryhards.svg`,
            },
            {
                balance: 1500,
                symbol: 'THX',
                name: 'THX Network',
                logoImg: `https://avatars.dicebear.com/api/identicon/thxnetwork.svg`,
            },
        ],
        rewards: [],
    }),
    actions: {
        async claim(uuid: string) {
            const accessToken = thx.session.cached.user?.access_token || '';
            const accountStore = useAccountStore();
            const r = await fetch(API_URL + `/v1/rewards/${uuid}/claim`, {
                method: 'POST',
                headers: new Headers([
                    ['X-PoolId', accountStore.config().poolId],
                    ['Authorization', `Bearer ${accessToken}`],
                ]),
                mode: 'cors',
            });
            const claim = await r.json();
            if (claim.error) {
                throw claim.error;
            } else {
                accountStore.getBalance();
                const index = this.rewards.findIndex((r) => r.uuid === uuid);
                this.rewards[index].isClaimed = true;
            }
        },
        async get(id: string) {
            const accessToken = thx.session.cached.user?.access_token || '';
            const r = await fetch(`${API_URL}/v1/referral-rewards/${id}`, {
                method: 'GET',
                headers: new Headers([
                    ['X-PoolId', useAccountStore().config().poolId],
                    ['Authorization', `Bearer ${accessToken}`],
                ]),
                mode: 'cors',
            });
            const results = await r.json();
            const index = this.rewards.findIndex((r: any) => r._id === id);
            this.rewards[index] = { ...this.rewards[index], ...results };
        },
        async getPointReward(id: string) {
            const accessToken = thx.session.cached.user?.access_token || '';
            const r = await fetch(`${API_URL}/v1/point-rewards/${id}`, {
                method: 'GET',
                headers: new Headers([
                    ['X-PoolId', useAccountStore().config().poolId],
                    ['Authorization', `Bearer ${accessToken}`],
                ]),
                mode: 'cors',
            });
            const results = await r.json();
            const index = this.rewards.findIndex((r: any) => r._id === id);
            this.rewards[index] = { ...this.rewards[index], ...results };
        },
        async list() {
            const r = await fetch(API_URL + '/v1/rewards', {
                method: 'GET',
                headers: new Headers([['X-PoolId', useAccountStore().config().poolId]]),
                mode: 'cors',
            });
            const results = await r.json();

            this.rewards = [
                ...Object.values(results.referralRewards).map((r: any) => {
                    r.component = 'BaseCardRewardReferral';
                    return r;
                }),
                ...Object.values(results.pointRewards).map((r: any) => {
                    r.component = 'BaseCardRewardPoints';
                    return r;
                }),
            ];
        },
    },
});

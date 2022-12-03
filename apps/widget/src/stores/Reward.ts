import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';
import { thx } from '../utils/thx';
import { useAccountStore } from './Account';

export const useRewardStore = defineStore('rewards', {
    state: (): TState => ({
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
        async claim(id: string) {
            const accessToken = thx.session.cached.user?.access_token || '';
            const r = await fetch(API_URL + `/v1/rewards/${id}/claim`, {
                method: 'POST',
                headers: new Headers([
                    ['X-PoolId', useAccountStore().poolId()],
                    ['Authorization', `Bearer ${accessToken}`],
                ]),
                mode: 'cors',
            });
            const results = await r.json();
            console.log(results);
        },
        async list() {
            const r = await fetch(API_URL + '/v1/rewards', {
                method: 'GET',
                headers: new Headers([['X-PoolId', useAccountStore().poolId()]]),
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

import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';
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
        async list() {
            const account = useAccountStore();
            const r = await fetch(API_URL + '/v1/rewards', {
                method: 'GET',
                headers: new Headers([['X-PoolId', account.poolId()]]),
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

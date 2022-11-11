import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';

export const useRewardStore = defineStore('rewards', {
    state: (): IState => ({
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
            const r = await fetch(API_URL + '/v1/point-rewards');
            const data = await r.json();
            const components = ['BaseCardRewardReferral', 'BaseCardRewardToken', 'BaseCardRewardNFT'];

            this.rewards = data.map((r: IReward) => {
                r.component = components[r.variant];
                return r;
            });
        },
    },
});

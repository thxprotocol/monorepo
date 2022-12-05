import { thx } from '../utils/thx';
import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';
import { RewardConditionPlatform } from '../types/enums/rewards';

export const useAccountStore = defineStore('account', {
    state: (): any => ({
        api: thx,
        config: () => {
            const data = sessionStorage.getItem('thx:widget:config');
            if (data) {
                return JSON.parse(data) as { poolId: string; origin: string };
            }
        },
        user: thx.session.cached.user,
        balance: 0,
        isAuthenticated: false,
        isConnected: {
            [RewardConditionPlatform.Google]: false,
            [RewardConditionPlatform.Twitter]: false,
        },
        account: null,
    }),
    actions: {
        async init({ id, origin }: { origin: string; id: string }) {
            if (id && origin) {
                sessionStorage.setItem('thx:widget:config', JSON.stringify({ origin, poolId: id }));
            }

            this.isAuthenticated = await thx.init();

            if (this.isAuthenticated) {
                this.getAccount();
            }
        },
        async getAccount() {
            this.account = await thx.account.get();
            if (!this.account) return;

            this.isConnected[RewardConditionPlatform.Google] = this.account.googleAccess;
            this.isConnected[RewardConditionPlatform.Twitter] = this.account.twitterAccess;
        },
        async getBalance() {
            const accessToken = thx.session.cached.user?.access_token || '';
            if (accessToken) {
                const r = await fetch(`${API_URL}/v1/point-balances`, {
                    method: 'GET',
                    headers: new Headers([
                        ['X-PoolId', this.config().poolId],
                        ['Authorization', `Bearer ${accessToken}`],
                    ]),
                    mode: 'cors',
                });
                const { balance } = await r.json();
                this.balance = balance;
            }
        },
    },
});

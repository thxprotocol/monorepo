import { thx } from '../utils/thx';
import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';

export const useAccountStore = defineStore('account', {
    state: () => ({
        api: thx,
        poolId: '',
        user: thx.session.cached.user,
        balance: 0,
        isAuthenticated: false,
    }),
    actions: {
        setPoolId(id: string) {
            this.poolId = id;
        },
        async init() {
            this.isAuthenticated = (await this.api.init()) || false;
        },
        async getBalance() {
            const accessToken = thx.session.cached.user?.access_token || '';
            if (accessToken) {
                const r = await fetch(`${API_URL}/v1/point-balances`, {
                    method: 'GET',
                    headers: new Headers([
                        ['X-PoolId', this.poolId],
                        ['Authorization', `Bearer ${accessToken}`],
                    ]),
                    mode: 'cors',
                });
                const data = await r.json();
                this.balance = data.balance;
            }
        },
    },
});

import { thx } from '../utils/thx';
import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';

export const useAccountStore = defineStore('account', {
    state: () => ({
        api: thx,
        poolId: () => sessionStorage.getItem('thx:widget:poolId') as string,
        user: thx.session.cached.user,
        balance: 0,
        isAuthenticated: false,
    }),
    actions: {
        async init(id: string) {
            if (id) {
                sessionStorage.setItem('thx:widget:poolId', id);
            }
            this.isAuthenticated = (await this.api.init()) || false;
        },
        async getBalance() {
            const accessToken = thx.session.cached.user?.access_token || '';
            if (accessToken) {
                const r = await fetch(`${API_URL}/v1/point-balances`, {
                    method: 'GET',
                    headers: new Headers([
                        ['X-PoolId', this.poolId()],
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

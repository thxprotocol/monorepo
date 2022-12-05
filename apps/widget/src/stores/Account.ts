import { Client as THXClient } from '@thxnetwork/sdk/src/lib/client';
import { defineStore } from 'pinia';
import { API_URL, CLIENT_ID, CLIENT_SECRET, WIDGET_URL } from '../config/secrets';
import { RewardConditionPlatform } from '../types/enums/rewards';

export const useAccountStore = defineStore('account', {
    state: (): any => ({
        api: null,
        config: () => {
            const data = sessionStorage.getItem('thx:widget:config');
            if (data) {
                return JSON.parse(data) as { poolId: string; origin: string };
            }
        },
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
            this.api = new THXClient({
                env: 'local',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                redirectUrl: WIDGET_URL,
                scopes: 'openid account:read erc20:read erc721:read point_balances:read referral_rewards:read point_rewards:read referal_reward_claims:write',
                poolId: id,
            });

            this.isAuthenticated = await this.api.init();

            if (this.isAuthenticated) {
                this.getAccount();
            }
        },
        async getAccount() {
            this.account = await this.api.account.get();
            if (!this.account) return;

            this.isConnected[RewardConditionPlatform.Google] = this.account.googleAccess;
            this.isConnected[RewardConditionPlatform.Twitter] = this.account.twitterAccess;
        },
        async getBalance() {
            const accessToken = this.api.session.cached.user?.access_token || '';
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

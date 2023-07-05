import { THXClient } from '@thxnetwork/sdk';
import { defineStore } from 'pinia';
import { CLIENT_ID, WIDGET_URL, AUTH_URL, API_URL } from '../config/secrets';
import { usePerkStore } from './Perk';
import { useRewardStore } from './Reward';
import { useWalletStore } from './Wallet';
import { track } from '@thxnetwork/mixpanel';
import { getStyles } from '../utils/theme';
import { useAuthStore } from './Auth';
import { setSessionState } from '../utils/pkce';

export const useAccountStore = defineStore('account', {
    state: (): TAccountState => ({
        poolId: '',
        api: null,
        account: null,
        balance: 0,
        subscription: null,
        isRewardsLoaded: false,
        isEthereumBrowser: window.ethereum && window.matchMedia('(pointer:coarse)').matches, // Feature only available on mobile devices
    }),
    actions: {
        getConfig: (poolId: string): TWidgetConfig => {
            const data = localStorage.getItem(`thx:widget:${poolId}:config`);
            if (!data) return {} as TWidgetConfig;
            return JSON.parse(data);
        },
        setConfig(poolId: string, config: TWidgetConfig) {
            const data = { ...this.getConfig(poolId), ...config };
            localStorage.setItem(`thx:widget:${poolId}:config`, JSON.stringify(data));
            this.poolId = poolId;
        },
        setTheme(config: TWidgetConfig) {
            const { title, theme } = config;
            const { elements, colors } = JSON.parse(theme);
            const sheet = getStyles(elements, colors);

            document.title = title;
            document.head.appendChild(sheet);
        },
        async init(poolId: string) {
            const authStore = useAuthStore();

            this.api = new THXClient({
                url: API_URL,
                accessToken: '',
                poolId,
            });
            this.poolId = poolId;

            const data = await this.api.request.get('/v1/widget/' + poolId);

            this.setConfig(this.poolId, data);
            this.setTheme(data);

            // Handle redirect result if any
            await authStore.requestOAuthShareRedirectCallback();
            await authStore.getUser();
            this.api.setAccessToken(authStore.user ? authStore.user.accessToken : '');
            this.getUserData();
            authStore.getPrivateKey();

            track('UserVisits', [
                this.account?.sub || '',
                'page with widget',
                { origin: this.getConfig(poolId).origin, poolId },
            ]);
        },
        updateLauncher() {
            const rewardsStore = useRewardStore();
            const amount = rewardsStore.rewards.filter((r) => !r.isClaimed).length;
            const { origin } = this.getConfig(this.poolId);

            // Return if not in iframe
            if (window.top === window.self) return;

            // Send the amount of unclaimed rewards to the parent window and update the launcher
            window.top?.postMessage({ message: 'thx.reward.amount', amount }, origin);
        },
        async getAccount() {
            this.account = await this.api.account.get();
        },
        async getBalance() {
            const { balance } = await this.api.pointBalance.list();
            this.balance = balance;
        },
        async subscribe(email: string) {
            this.subscription = await this.api.pools.subscription.post({ poolId: this.poolId, email });

            const { origin } = this.getConfig(this.poolId);
            track('UserCreates', [this.account?.sub, 'pool subscription', { poolId: this.poolId, origin }]);
        },
        async unsubscribe() {
            this.subscription = await this.api.pools.subscription.delete(this.poolId);

            const { origin } = this.getConfig(this.poolId);
            track('UserCreates', [this.account?.sub, 'pool unsubscription', { poolId: this.poolId, origin }]);
        },
        async getSubscription() {
            this.subscription = await this.api.pools.subscription.get(this.poolId);
        },
        async signin(extraQueryParams?: { [key: string]: string }) {
            const authStore = useAuthStore();

            await authStore.requestOAuthShare(extraQueryParams);
            await authStore.getUser();
            this.api.setAccessToken(authStore.user ? authStore.user.accessToken : '');
            this.getUserData();
            authStore.getPrivateKey();
        },
        async signout() {
            const authStore = useAuthStore();
            if (!authStore.user) return;
            localStorage.removeItem(`thx.user:${AUTH_URL}:${CLIENT_ID}`);

            try {
                const url = new URL(AUTH_URL + '/session/end');
                const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300,left=100,top=100`;
                const { id } = authStore.user.state as any;

                url.searchParams.append('id_token_hint', authStore.user.idToken);
                url.searchParams.append('post_logout_redirect_uri', WIDGET_URL + '/signout-popup.html');
                url.searchParams.append('state', id);

                setSessionState(id, { returnUrl: window.location.href });

                window.open(url, '', params);
            } catch (error) {
                console.error(error);
            } finally {
                authStore.oAuthShare = '';
            }
        },
        async getUserData() {
            const rewardsStore = useRewardStore();
            const perksStore = usePerkStore();
            const walletStore = useWalletStore();
            const { oAuthShare } = useAuthStore();

            rewardsStore.list().then(() => {
                const { origin } = this.getConfig(this.poolId);
                const amount = rewardsStore.rewards.filter((r) => !r.isClaimed).length;

                // Send the amount of unclaimed rewards to the parent window and update the launcher
                if (window.self !== window.top) {
                    window.top?.postMessage({ message: 'thx.reward.amount', amount }, origin);
                }

                this.isRewardsLoaded = true;
            });
            perksStore.list();

            // Guard HTTP requests that do require auth
            if (!oAuthShare) return;

            await this.getAccount();

            this.getBalance();
            this.getSubscription();

            walletStore.list();
            walletStore.getWallet();

            track('UserSignsIn', [this.account, { origin, poolId: this.poolId }]);
        },
    },
});

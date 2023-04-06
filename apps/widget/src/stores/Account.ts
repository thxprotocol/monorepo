import { THXClient } from '@thxnetwork/sdk';
import { defineStore } from 'pinia';
import { PKG_ENV, CLIENT_ID, CLIENT_SECRET, WIDGET_URL } from '../config/secrets';
import { usePerkStore } from './Perk';
import { useRewardStore } from './Reward';
import { useWalletStore } from './Wallet';
import { track } from '@thxnetwork/mixpanel';

export const useAccountStore = defineStore('account', {
    state: (): TAccountState => ({
        getConfig: (id: string): TWidgetConfig => {
            const data = sessionStorage.getItem(`thx:widget:${id}:config`);
            if (!data) return {} as TWidgetConfig;
            return JSON.parse(data);
        },
        poolId: '',
        api: null,
        account: null,
        balance: 0,
        subscription: null,
        isAuthenticated: false,
    }),
    actions: {
        setConfig(id: string, config: TWidgetConfig) {
            const data = { ...this.getConfig(id), ...config };
            sessionStorage.setItem(`thx:widget:${id}:config`, JSON.stringify(data));
        },
        init({ id, origin, chainId, theme }: { origin: string; id: string; chainId: number; theme: string } & any) {
            this.poolId = id;

            if (!this.poolId) throw new Error('No poolId in settings.');
            if (!origin) throw new Error('No origin in settings.');
            if (!chainId) throw new Error('No chainId in settings.');

            this.setConfig(id, { origin, poolId: id, chainId, theme });

            this.api = new THXClient({
                env: PKG_ENV,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                redirectUrl: WIDGET_URL + '/signin-popup.html',
                post_logout_redirect_uri: WIDGET_URL + '/signout-popup.html',
                popup_post_logout_redirect_uri: WIDGET_URL + '/signout-popup.html',
                scopes: 'openid account:read erc20:read erc721:read point_balances:read referral_rewards:read shopify_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write',
                poolId: this.poolId,
            });

            this.api.userManager.cached.events.addAccessTokenExpired(this.onAccessTokenExpired);
            this.api.userManager.cached.events.addAccessTokenExpiring(this.onAccessTokenExpiring);
            this.api.userManager.cached.events.addUserLoaded(this.onUserLoaded);
            this.api.userManager.cached.events.addUserUnloaded(this.onUserLoaded);
            this.api.userManager.cached.events.load(this.onLoad);
        },
        updateLauncher() {
            const rewardsStore = useRewardStore();
            const amount = rewardsStore.rewards.filter((r) => !r.isClaimed).length;
            const { origin } = this.getConfig(this.poolId);

            // Send the amount of unclaimed rewards to the parent window and update the launcher
            window.top?.postMessage({ message: 'thx.reward.amount', amount }, origin);
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
        signin() {
            const { poolId } = this.getConfig(this.poolId);
            this.api.userManager.cached.signinPopup({
                extraQueryParams: {
                    pool_id: poolId,
                },
            });
        },
        signout() {
            this.api.userManager.cached.signoutPopup();
        },
        async onLoad() {
            this.isAuthenticated = !!(await this.api.userManager.getUser());
        },
        async onUserUnloaded() {
            const rewardsStore = useRewardStore();
            rewardsStore.list().then(this.updateLauncher);

            this.isAuthenticated = false;
        },
        async onUserLoaded() {
            const rewardsStore = useRewardStore();
            const perksStore = usePerkStore();
            const walletStore = useWalletStore();

            this.isAuthenticated = !!(await this.api.userManager.getUser());

            rewardsStore.list().then(() => {
                const { origin } = this.getConfig(this.poolId);
                const amount = rewardsStore.rewards.filter((r) => !r.isClaimed).length;
                // Send the amount of unclaimed rewards to the parent window and update the launcher
                window.top?.postMessage({ message: 'thx.reward.amount', amount }, origin);
            });

            // Guard HTTP requests that do require auth
            if (!this.isAuthenticated) return;

            await this.getAccount();
            this.getBalance();
            this.getSubscription();

            perksStore.list();
            walletStore.list();
            walletStore.getWallet();

            this.isAuthenticated = true;

            track('UserSignsIn', [this.account, { origin, poolId: this.poolId }]);
        },
        onAccessTokenExpired() {
            this.api.userManager.cached.signoutPopup();
        },
        onAccessTokenExpiring() {
            //
        },
        async getAccount() {
            this.account = await this.api.account.get();
        },
        async getBalance() {
            const { balance } = await this.api.pointBalanceManager.list();
            this.balance = balance;
        },
    },
});

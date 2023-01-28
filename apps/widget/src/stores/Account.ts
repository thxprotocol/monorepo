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
        isAuthenticated: false,
    }),
    actions: {
        setConfig(id: string, config: TWidgetConfig) {
            const data = { ...this.getConfig(id), ...config };
            sessionStorage.setItem(`thx:widget:${id}:config`, JSON.stringify(data));
        },
        async init({
            id,
            origin,
            chainId,
            theme,
        }: { origin: string; id: string; chainId: number; theme: string } & any) {
            this.poolId = id;

            if (!this.poolId) throw new Error('No poolId in settings.');
            if (!origin) throw new Error('No origin in settings.');
            if (!chainId) throw new Error('No chainId in settings.');

            const config = this.getConfig(id);
            this.setConfig(id, { origin, poolId: id, chainId, theme: config.theme || theme });

            this.api = new THXClient({
                env: PKG_ENV,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                redirectUrl: WIDGET_URL + '/signin-popup.html',
                popup_post_logout_redirect_uri: WIDGET_URL + '/signout-popup.html',
                scopes: 'openid account:read erc20:read erc721:read point_balances:read referral_rewards:read point_rewards:read wallets:read',
                poolId: this.poolId,
            });

            this.api.userManager.cached.events.addAccessTokenExpired(this.onAccessTokenExpired);
            this.api.userManager.cached.events.addAccessTokenExpiring(this.onAccessTokenExpiring);
            this.api.userManager.cached.events.addUserLoaded(this.onUserLoaded);
            this.api.userManager.cached.events.addUserUnloaded(this.onUserLoaded);
            this.api.userManager.cached.events.load(this.onLoad);
        },
        setTheme(theme: string) {
            const data = JSON.parse(sessionStorage.getItem('thx:widget:config') as string);
            sessionStorage.setItem('thx:widget:config', JSON.stringify({ ...data, theme }));
        },
        updateLauncher() {
            const rewardsStore = useRewardStore();
            const amount = rewardsStore.rewards.filter((r) => !r.isClaimed).length;
            const { origin } = this.getConfig(this.poolId);

            // Send the amount of unclaimed rewards to the parent window and update the launcher
            window.top?.postMessage({ message: 'thx.reward.amount', amount }, origin);
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
            await this.getBalance();

            await perksStore.list();
            await walletStore.list();
            await walletStore.getWallet();

            this.isAuthenticated = true;

            track('UserSignsIn', [this.account]);
        },
        onAccessTokenExpired() {
            this.api.signout();
        },
        onAccessTokenExpiring() {
            this.api.userManager.cached.signinSilent();
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

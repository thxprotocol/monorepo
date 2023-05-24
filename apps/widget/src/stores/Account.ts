import { THXClient } from '@thxnetwork/sdk';
import { defineStore } from 'pinia';
import { PKG_ENV, CLIENT_ID, CLIENT_SECRET, WIDGET_URL } from '../config/secrets';
import { usePerkStore } from './Perk';
import { useRewardStore } from './Reward';
import { useWalletStore } from './Wallet';
import { useClaimStore } from './Claim';
import { track } from '@thxnetwork/mixpanel';
import { getReturnUrl } from '../utils/returnUrl';
import { getStyles } from '../utils/theme';

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
        isRewardsLoaded: false,
        isEthereumBrowser: window.ethereum && window.matchMedia('(pointer:coarse)').matches, // Feature only available on mobile devices
    }),
    actions: {
        setConfig(poolId: string, config: TWidgetConfig) {
            const data = { ...this.getConfig(poolId), ...config };
            sessionStorage.setItem(`thx:widget:${poolId}:config`, JSON.stringify(data));
            this.poolId = poolId;
        },
        setTheme() {
            const { title, theme } = this.getConfig(this.poolId);
            const { elements, colors } = JSON.parse(theme);
            const styles: any = getStyles(elements, colors);
            const sheet = document.createElement('style');

            for (const selector in styles) {
                let rule = `${selector} { `;
                for (const name in styles[selector]) {
                    rule += `${name}: ${styles[selector][name]};`;
                }
                rule += '}';
                sheet.innerText += rule;
            }

            document.title = title;
            document.head.appendChild(sheet);
        },
        init(config: TWidgetConfig) {
            this.setConfig(config.poolId, config);
            this.setTheme();

            this.api = new THXClient({
                env: PKG_ENV,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                redirectUrl: WIDGET_URL + '/signin-popup.html',
                post_logout_redirect_uri: WIDGET_URL + '/signout-popup.html',
                popup_post_logout_redirect_uri: WIDGET_URL + '/signout-popup.html',
                scopes: 'openid account:read account:write erc20:read erc721:read erc1155:read point_balances:read referral_rewards:read shopify_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write claims:read',
                poolId: this.poolId,
            });

            this.api.userManager.cached.events.addAccessTokenExpired(this.onAccessTokenExpired);
            this.api.userManager.cached.events.addAccessTokenExpiring(this.onAccessTokenExpiring);
            this.api.userManager.cached.events.addUserLoaded(this.onUserLoaded);
            this.api.userManager.cached.events.addUserUnloaded(this.onUserUnloaded);
            this.api.userManager.cached.events.load(this.onLoad);

            track('UserVisits', [
                this.account?.sub || '',
                'page with widget',
                { origin: config.origin, poolId: this.poolId },
            ]);
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
        async signin(extraQueryParams = {}) {
            const config = this.getConfig(this.poolId);
            const { claim } = useClaimStore();
            const url = getReturnUrl(config);
            const method = this.isEthereumBrowser || (window as any).Cypress ? 'signinRedirect' : 'signinPopup';

            await this.api.userManager.cached[method]({
                state: { url, clientId: CLIENT_ID },
                extraQueryParams: {
                    return_url: url,
                    pool_id: config.poolId,
                    claim_id: claim?.uuid,
                    ...extraQueryParams,
                },
            });
        },
        signout() {
            const { origin } = this.getConfig(this.poolId);
            const method = this.isEthereumBrowser ? 'signoutRedirect' : 'signoutPopup';

            this.api.userManager.cached[method]({
                state: { origin },
            });
        },
        async onLoad() {
            this.isAuthenticated = !!(await this.api.userManager.getUser());
        },
        async onUserUnloaded() {
            const rewardsStore = useRewardStore();
            const perksStore = usePerkStore();

            rewardsStore.list().then(this.updateLauncher);
            perksStore.list();

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
                this.isRewardsLoaded = true;
            });
            perksStore.list();

            // Guard HTTP requests that do require auth
            if (!this.isAuthenticated) return;

            await this.getAccount();
            this.getBalance();
            this.getSubscription();

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

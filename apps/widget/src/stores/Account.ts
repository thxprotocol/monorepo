import { THXClient } from '@thxnetwork/sdk';
import { defineStore } from 'pinia';
import { PKG_ENV, CLIENT_ID, CLIENT_SECRET, WIDGET_URL, AUTH_URL } from '../config/secrets';
import { usePerkStore } from './Perk';
import { useRewardStore } from './Reward';
import { useWalletStore } from './Wallet';
import { useClaimStore } from './Claim';
import { track } from '@thxnetwork/mixpanel';
import { getReturnUrl } from '../utils/returnUrl';
import { getStyles } from '../utils/theme';
import { getUxMode, tKey } from '../utils/tkey';

const VERIFIER_NAME = 'thx-custom-sapphire-devnet-local';

export const useAccountStore = defineStore('account', {
    state: (): TAccountState => ({
        getConfig: (id: string): TWidgetConfig => {
            const data = localStorage.getItem(`thx:widget:${id}:config`);
            if (!data) return {} as TWidgetConfig;
            return JSON.parse(data);
        },
        user: null,
        oAuthShare: '',
        privateKey: '',
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
            localStorage.setItem(`thx:widget:${poolId}:config`, JSON.stringify(data));
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

            this.onUserLoaded();

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
        async signin(extraQueryParams?: { [key: string]: string }) {
            await (tKey.serviceProvider as any).init({ skipSw: true });
            await tKey.modules.securityQuestions.initialize();

            const config = this.getConfig(this.poolId);
            const { claim } = useClaimStore();
            const url = getReturnUrl(config);
            const uxMode = getUxMode();
            const loginResponse = await (tKey.serviceProvider as any).triggerLogin({
                verifier: VERIFIER_NAME,
                typeOfLogin: 'jwt',
                clientId: CLIENT_ID,
                enableLogging: true,
                uxMode,
                customState: {
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                },
                jwtParams: {
                    domain: AUTH_URL,
                    prompt: 'login',
                    redirect_uri: WIDGET_URL + '/signin-popup.html',
                    response_type: 'code',
                    scope: 'openid account:read account:write erc20:read erc721:read erc1155:read point_balances:read referral_rewards:read shopify_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write claims:read',
                    return_url: url,
                    pool_id: config.poolId,
                    claim_id: claim?.uuid,
                    ...extraQueryParams,
                },
            });

            localStorage.setItem(`thx.user:${AUTH_URL}:${CLIENT_ID}`, JSON.stringify(loginResponse.userInfo));

            this.user = loginResponse.userInfo;
            this.oAuthShare = loginResponse.privateKey;

            await tKey.initialize(); // 1/2 flow

            // Gets the deviceShare
            try {
                await (tKey.modules.webStorage as any).inputShareFromWebStorage(); // 2/2 flow
            } catch (e) {
                console.log(e);
            }

            // Checks the requiredShares to reconstruct the tKey,
            // starts from 2 by default and each of the above share reduce it by one.
            const { requiredShares } = tKey.getKeyDetails();
            if (requiredShares <= 0) {
                const reconstructedKey = await tKey.reconstructKey();
                this.privateKey = reconstructedKey?.privKey.toString('hex');
                this.isAuthenticated = true;
                this.onUserLoaded();
            }
        },
        signout() {
            // TODO (not supported in tKey)
            // call /session/end potentially with hint
        },
        async createDeviceShare(value: string) {
            if (value.length > 10) {
                try {
                    await (tKey.modules.securityQuestions as any).generateNewShareWithSecurityQuestions(
                        value,
                        'what is your password?',
                    );
                    console.log('Successfully generated new share with password.');
                } catch (error) {
                    console.log('Error', (error as any)?.message.toString(), 'error');
                }
            } else {
                console.log('Error', 'Password must be >= 11 characters', 'error');
            }
        },
        async updateDeviceShare(value: string) {
            if (value.length > 10) {
                await (tKey.modules.securityQuestions as any).changeSecurityQuestionAndAnswer(
                    value,
                    'whats your password?',
                );
                console.log('Successfully changed new share with password.');
            } else {
                console.log('Error', 'Password must be >= 11 characters', 'error');
            }
        },
        async recoverDeviceShare(value: string) {
            if (value.length > 10) {
                await (tKey.modules.securityQuestions as any).inputShareFromSecurityQuestions(value); // 2/2 flow

                const { requiredShares } = tKey.getKeyDetails();
                if (requiredShares <= 0) {
                    const reconstructedKey = await tKey.reconstructKey();
                    this.privateKey = reconstructedKey?.privKey.toString('hex');
                    console.log('Private Key: ' + reconstructedKey.privKey.toString('hex'));
                }
                const newShare = await tKey.generateNewShare();
                const shareStore = await tKey.outputShareStore(newShare.newShareIndex);

                await (tKey.modules.webStorage as any).storeDeviceShare(shareStore);

                console.log('Successfully logged you in with the recovery password.');
            } else {
                console.error('Password must be >= 11 characters');
            }
        },

        // async signin(extraQueryParams = {}) {
        //     const config = this.getConfig(this.poolId);
        //     const { claim } = useClaimStore();
        //     const url = getReturnUrl(config);
        //     const method = this.isEthereumBrowser || (window as any).Cypress ? 'signinRedirect' : 'signinPopup';

        //     await this.api.userManager.cached[method]({
        //         state: { url, clientId: CLIENT_ID },
        //         extraQueryParams: {
        //             return_url: url,
        //             pool_id: config.poolId,
        //             claim_id: claim?.uuid,
        //             ...extraQueryParams,
        //         },
        //     });
        // },
        // signout() {
        //     const { origin } = this.getConfig(this.poolId);
        //     const method = this.isEthereumBrowser ? 'signoutRedirect' : 'signoutPopup';

        //     this.api.userManager.cached[method]({
        //         state: { origin },
        //     });
        // },
        // async onLoad() {
        //     this.isAuthenticated = !!(await this.api.userManager.getUser());
        // },
        // async onUserUnloaded() {
        //     const rewardsStore = useRewardStore();
        //     const perksStore = usePerkStore();

        //     rewardsStore.list().then(this.updateLauncher);
        //     perksStore.list();

        //     this.isAuthenticated = false;
        // },
        async onUserLoaded() {
            const rewardsStore = useRewardStore();
            const perksStore = usePerkStore();
            const walletStore = useWalletStore();

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
        // onAccessTokenExpired() {
        //     this.api.userManager.cached.signoutPopup();
        // },
        // onAccessTokenExpiring() {
        //     //
        // },
        async getAccount() {
            this.account = await this.api.account.get();
        },
        async getBalance() {
            const { balance } = await this.api.pointBalanceManager.list();
            this.balance = balance;
        },
    },
});

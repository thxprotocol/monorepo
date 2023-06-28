import { THXClient } from '@thxnetwork/sdk';
import { defineStore } from 'pinia';
import { CLIENT_ID, CLIENT_SECRET, WIDGET_URL, AUTH_URL, API_URL } from '../config/secrets';
import { usePerkStore } from './Perk';
import { useRewardStore } from './Reward';
import { useWalletStore } from './Wallet';
import { useClaimStore } from './Claim';
import { track } from '@thxnetwork/mixpanel';
import { getReturnUrl } from '../utils/returnUrl';
import { getStyles } from '../utils/theme';
import { getUxMode, tKey } from '../utils/tkey';
import * as jose from 'jose';

const VERIFIER_NAME = 'thx-custom-sapphire-devnet-local';

export const useAccountStore = defineStore('account', {
    state: (): TAccountState => ({
        user: null,
        oAuthShare: '',
        privateKey: '',
        poolId: '',
        api: null,
        account: null,
        balance: 0,
        subscription: null,
        securityQuestion: '',
        isAuthenticated: false,
        isRewardsLoaded: false,
        isDeviceShareAvailable: false,
        isEthereumBrowser: window.ethereum && window.matchMedia('(pointer:coarse)').matches, // Feature only available on mobile devices
    }),
    actions: {
        getConfig: (id: string): TWidgetConfig => {
            const data = localStorage.getItem(`thx:widget:${id}:config`);
            if (!data) return {} as TWidgetConfig;
            return JSON.parse(data);
        },
        setConfig(poolId: string, config: TWidgetConfig) {
            const data = { ...this.getConfig(poolId), ...config };
            localStorage.setItem(`thx:widget:${poolId}:config`, JSON.stringify(data));
            this.poolId = poolId;
            this.api = new THXClient({
                url: API_URL,
                accessToken: '',
                poolId: this.poolId,
            });
        },
        setTheme() {
            const { title, theme } = this.getConfig(this.poolId);
            const { elements, colors } = JSON.parse(theme);
            const sheet = getStyles(elements, colors);

            document.title = title;
            document.head.appendChild(sheet);
        },
        init(config: TWidgetConfig) {
            this.setConfig(config.poolId, config);
            this.setTheme();
            this.getUser().then(() => this.getUserData());

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
        async getOAuthShare(extraQueryParams?: { [key: string]: string }) {
            const config = this.getConfig(this.poolId);
            const { claim } = useClaimStore();
            const loginResponse = await tKey.serviceProvider.triggerLogin({
                verifier: VERIFIER_NAME,
                typeOfLogin: 'jwt',
                clientId: CLIENT_ID,
                enableLogging: true,
                uxMode: getUxMode(),
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
                    return_url: getReturnUrl(config),
                    pool_id: config.poolId,
                    claim_id: claim?.uuid,
                    ...extraQueryParams,
                },
            });

            this.setUser(loginResponse.userInfo);
            this.oAuthShare = loginResponse.privateKey;
            this.isAuthenticated = true;

            await tKey.initialize();
        },
        async signin(extraQueryParams?: { [key: string]: string }) {
            await tKey.serviceProvider.init({ skipSw: true });
            await tKey.modules.securityQuestions.initialize();
            await this.getOAuthShare(extraQueryParams);
            await this.getDeviceShare();

            this.getUserData();
            this.reconstructKey();
            this.getSecurityQuestion();
        },
        async validateToken(accessToken: string) {
            try {
                const jwks = jose.createRemoteJWKSet(new URL(AUTH_URL + '/jwks'));
                const { payload } = await jose.jwtVerify(accessToken, jwks, {
                    issuer: AUTH_URL,
                    audience: CLIENT_ID,
                });
                if (Date.now() > Number(payload.exp) * 1000) {
                    throw new Error('token expired');
                }
            } catch (error) {
                await this.signin();
            }
        },
        async getUser() {
            const storageKey = `thx.user:${AUTH_URL}:${CLIENT_ID}`;
            const item = localStorage.getItem(storageKey) as string;

            // Set user on storage hit
            if (item) {
                this.user = JSON.parse(item);
            }

            // Validate user token expiry
            if (this.user) {
                await this.validateToken(this.user.accessToken);
                this.isAuthenticated = true;
            }

            // Set API client
            this.api = new THXClient({
                url: API_URL,
                accessToken: this.user ? this.user.accessToken : '',
                poolId: this.poolId,
            });
        },
        setUser(userInfo: THXAuthUser) {
            localStorage.setItem(`thx.user:${AUTH_URL}:${CLIENT_ID}`, JSON.stringify(userInfo));
            this.user = userInfo;
        },
        async signout() {
            try {
                await fetch(AUTH_URL + '/session/end');
                localStorage.removeItem(`thx.user:${AUTH_URL}:${CLIENT_ID}`);
                this.isAuthenticated = false;
            } catch (error) {
                //
            }
        },
        validatePassword(value: string) {
            if (value.length <= 10) {
                throw new Error('Error: Password must be >= 11 characters');
            }
        },
        async reset() {
            // WARNING Irrevertible
            await tKey.storageLayer.setMetadata({
                privKey: this.oAuthShare as any,
                input: { message: 'KEY_NOT_FOUND' },
            });
        },
        async reconstructKey() {
            // Checks the requiredShares to reconstruct the tKey,
            // starts from 2 by default and each of the above share reduce it by one.
            const { requiredShares } = tKey.getKeyDetails();
            if (requiredShares <= 0) {
                const reconstructedKey = await tKey.reconstructKey();
                this.privateKey = reconstructedKey?.privKey.toString('hex');
                console.log('Successfully reconstructed private key.');
            }
        },
        async getDeviceShare() {
            try {
                await tKey.modules.webStorage.inputShareFromWebStorage(); // 2/2 flow
                this.isDeviceShareAvailable = true;
                console.log('Successfully asserted device share.');
            } catch (e) {
                console.log(e);
            }
        },
        async getSecurityQuestion() {
            try {
                this.securityQuestion = await tKey.modules.securityQuestions.getSecurityQuestions();
                console.log('Successfully got security question.');
            } catch (error) {
                console.error(error);
            }
        },
        async createDeviceShare(question: string, answer: string) {
            this.validatePassword(answer);

            try {
                await tKey.modules.securityQuestions.generateNewShareWithSecurityQuestions(answer, question);
                console.log('Successfully generated new share with password.');
            } catch (error) {
                console.log('Error', (error as any)?.message.toString(), 'error');
            }
        },
        async updateDeviceShare(answer: string) {
            this.validatePassword(answer);

            await tKey.modules.securityQuestions.changeSecurityQuestionAndAnswer(answer, this.securityQuestion);
            console.log('Successfully changed new share with password.');
        },
        async recoverDeviceShare(value: string) {
            this.validatePassword(value);

            await tKey.modules.securityQuestions.inputShareFromSecurityQuestions(value); // 2/2 flow
            await this.reconstructKey();

            const newShare = await tKey.generateNewShare();
            const shareStore = tKey.outputShareStore(newShare.newShareIndex);

            await tKey.modules.webStorage.storeDeviceShare(shareStore);
            await this.getDeviceShare();

            console.log('Successfully logged you in with the recovery password.');
        },
        async getUserData() {
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

            track('UserSignsIn', [this.account, { origin, poolId: this.poolId }]);
        },
    },
});

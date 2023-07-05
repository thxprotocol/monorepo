import { THXClient } from '@thxnetwork/sdk';
import { defineStore } from 'pinia';
import { CLIENT_ID, CLIENT_SECRET, WIDGET_URL, AUTH_URL, API_URL } from '../config/secrets';
import { usePerkStore } from './Perk';
import { useRewardStore } from './Reward';
import { useWalletStore } from './Wallet';
import { useClaimStore } from './Claim';
import { track } from '@thxnetwork/mixpanel';
import { getStyles } from '../utils/theme';
import { getUxMode, tKey } from '../utils/tkey';
import * as jose from 'jose';
import { randHex } from '../utils/rand-hex';
import { generateCodeChallenge } from '../utils/pkce';

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
        isDeviceShareAvailable: null,
        isSecurityQuestionAvailable: null,
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
        async init(config: TWidgetConfig) {
            this.api = new THXClient({
                url: API_URL,
                accessToken: '',
                poolId: config.poolId,
            });
            this.poolId = config.poolId;

            const data = await this.api.request.get('/v1/widget/' + config.poolId);

            this.setConfig(this.poolId, data);
            this.setTheme(data);

            await this.getUser();
            await this.signinCallback();

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
            await this.requestOAuthShare(extraQueryParams);
            await this.getUser();
            await this.signinCallback();
        },
        async signinCallback() {
            this.getUserData();
            if (this.oAuthShare) {
                await this.getDeviceShare();
                this.reconstructKey();
                this.getSecurityQuestion();
            }
        },
        getRequestConfig(sessionId: string, jwtParams?: { [key: string]: string | undefined }) {
            const uxMode = getUxMode();
            return {
                verifier: VERIFIER_NAME,
                typeOfLogin: 'jwt',
                clientId: CLIENT_ID,
                enableLogging: true,
                uxMode,
                customState: {
                    id: sessionId,
                    poolId: this.poolId,
                    uxMode,
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    returnUrl: window.location.href,
                    postLogoutRedirectUri: WIDGET_URL + '/signout-popup.html',
                },
                jwtParams,
            };
        },
        async requestOAuthShare(extraQueryParams?: { [key: string]: string }) {
            const config = this.getConfig(this.poolId);
            const { claim } = useClaimStore();
            const { codeVerifier, codeChallenge } = await generateCodeChallenge();
            const sessionId = randHex(32);
            const redirectUri = WIDGET_URL + '/signin-popup.html';

            this.setSessionState(sessionId, {
                redirectUri,
                codeVerifier,
                returnUrl: window.location.href,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
            });

            const requestConfig = this.getRequestConfig(sessionId, {
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
                domain: AUTH_URL,
                resource: API_URL,
                redirect_uri: redirectUri,
                response_type: 'code',
                response_mode: 'query',
                prompt: '', // Should be an empty string to avoid default 'login' prompt
                grant_type: 'authorization_code',
                scope: 'openid account:read account:write erc20:read erc721:read erc1155:read point_balances:read referral_rewards:read shopify_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write claims:read',
                return_url: window.location.href,
                pool_id: config.poolId,
                claim_id: claim?.uuid,
                ...extraQueryParams,
            });

            await tKey.serviceProvider.init({ skipSw: true });
            await tKey.modules.securityQuestions.initialize();

            const loginResponse = await tKey.serviceProvider.triggerLogin(requestConfig);

            // Only popup flow continues here
            this.setUser(loginResponse.userInfo);
            this.oAuthShare = loginResponse.privateKey;
            this.isAuthenticated = true;

            await tKey.initialize();
        },
        async requestOAuthShareRedirectCallback() {
            const url = new URL(window.location.href);
            const stateString = url.searchParams.get('state');
            if (!stateString) return;

            const state = JSON.parse(window.atob(stateString.split('%')[0]));
            const sessionStateKey = `thx.${state.id}`;
            const session = JSON.parse(localStorage.getItem(sessionStateKey) as string);

            await tKey.serviceProvider.init({ skipSw: true });
            await tKey.modules.securityQuestions.initialize();

            const redirectUri = WIDGET_URL + '/signin-popup.html';
            const user = await this.getToken(url, sessionStateKey, session);

            const requestConfig = {
                verifier: VERIFIER_NAME,
                typeOfLogin: 'jwt',
                clientId: CLIENT_ID,
                enableLogging: true,
                uxMode: getUxMode(),
                redirect_uri: redirectUri,
                hash: `#state=${stateString}&access_token=${user.access_token}&id_token=${user.id_token}`,
                queryParameters: window.location.search,
                jwtParams: {
                    domain: AUTH_URL,
                    accessToken: user.access_token,
                    idToken: user.id_token,
                },
            };
            // Trigger login with access and id token hash
            const loginResponse = await tKey.serviceProvider.triggerLogin(requestConfig);

            // Override empty state object in order to do proper removal of session state post sign out
            loginResponse.userInfo.state = { id: state.id };

            this.setUser(loginResponse.userInfo);
            this.api.setAccessToken(this.user ? this.user.accessToken : '');
            this.oAuthShare = loginResponse.privateKey;
            this.isAuthenticated = true;

            await tKey.initialize();
        },
        async getUser() {
            const url = new URL(window.location.href);
            if (url && url.searchParams.has('code')) {
                await this.requestOAuthShareRedirectCallback();
            } else {
                // Set user on storage hit
                const storageKey = `thx.user:${AUTH_URL}:${CLIENT_ID}`;
                const item = localStorage.getItem(storageKey) as string;
                if (item) {
                    const user = JSON.parse(item);
                    // Validate user token expiry
                    await this.validateToken(user.accessToken);

                    this.user = user;
                    this.api.setAccessToken(this.user ? this.user.accessToken : '');
                    this.isAuthenticated = true;

                    if (!this.oAuthShare) {
                        this.signin();
                    }
                }
            }
        },
        setUser(userInfo: THXAuthUser) {
            localStorage.setItem(`thx.user:${AUTH_URL}:${CLIENT_ID}`, JSON.stringify(userInfo));
            this.user = userInfo;
        },
        async getToken(url: any, sessionStateKey: string, session: any) {
            const code = url.searchParams.get('code');
            const iss = url.searchParams.get('iss');
            const response = await fetch(iss + '/token', {
                method: 'post',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: session.redirectUri,
                    code_verifier: session.codeVerifier,
                    client_id: session.clientId,
                    client_secret: session.clientSecret,
                }),
            });

            localStorage.removeItem(sessionStateKey);

            return await response.json();
        },
        async signout() {
            if (!this.user) return;
            localStorage.removeItem(`thx.user:${AUTH_URL}:${CLIENT_ID}`);

            try {
                const url = new URL(AUTH_URL + '/session/end');
                const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=300,left=100,top=100`;
                const { id } = this.user.state as any;

                url.searchParams.append('id_token_hint', this.user.idToken);
                url.searchParams.append('post_logout_redirect_uri', WIDGET_URL + '/signout-popup.html');
                url.searchParams.append('state', id);

                this.setSessionState(id, { returnUrl: window.location.href });

                window.open(url, '', params);
            } catch (error) {
                console.error(error);
            } finally {
                this.isAuthenticated = false;
            }
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
        setSessionState(id: string, state: any) {
            const storageKey = `thx.${id}`;
            const current = localStorage.getItem(storageKey);
            const storage = current && JSON.parse(current);
            localStorage.setItem(storageKey, JSON.stringify({ ...storage, ...state }));
        },
        validatePassword(value: string) {
            if (value.length <= 10) {
                throw new Error('Error: Password must be >= 11 characters');
            }
        },
        async reset() {
            // WARNING Irreversible
            await tKey.storageLayer.setMetadata({
                privKey: this.oAuthShare as any,
                input: { message: 'KEY_NOT_FOUND' },
            });
            await this.signout();
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
            // Setting the bool will trigger a watcher that displays the recovery modal
            try {
                await tKey.modules.webStorage.inputShareFromWebStorage(); // 2/2 flow
                this.isDeviceShareAvailable = true;
                console.log('Successfully asserted device share.');
            } catch (e) {
                this.isDeviceShareAvailable = false;
                console.error(e);
            }
        },
        async getSecurityQuestion() {
            try {
                this.securityQuestion = await tKey.modules.securityQuestions.getSecurityQuestions();
                this.isSecurityQuestionAvailable = true;
                console.log('Successfully got security question.');
            } catch (error) {
                this.isSecurityQuestionAvailable = false;
                console.error(error);
            }
        },
        async createDeviceShare(question: string, answer: string) {
            this.validatePassword(answer);

            try {
                await tKey.modules.securityQuestions.generateNewShareWithSecurityQuestions(answer, question);
                console.log('Successfully generated new share with password.');
                await this.getSecurityQuestion();
            } catch (error) {
                console.log('Error', (error as any)?.message.toString(), 'error');
            }
        },
        async updateDeviceShare(answer: string, question: string) {
            this.validatePassword(answer);

            await tKey.modules.securityQuestions.changeSecurityQuestionAndAnswer(answer, question);
            await this.getSecurityQuestion();
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
                if (window.self !== window.top) {
                    window.top?.postMessage({ message: 'thx.reward.amount', amount }, origin);
                }

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

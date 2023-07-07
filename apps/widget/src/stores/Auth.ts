import { defineStore } from 'pinia';
import { CLIENT_ID, CLIENT_SECRET, WIDGET_URL, AUTH_URL, VERIFIER_ID } from '../config/secrets';
import { useClaimStore } from './Claim';
import { getRequestConfig, getUxMode, tKey } from '../utils/tkey';
import * as jose from 'jose';
import { generateCodeChallenge, getSessionState, setSessionState } from '../utils/pkce';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';

export const useAuthStore = defineStore('auth', {
    state: (): TAuthState => ({
        user: null,
        privateKey: '',
        oAuthShare: '',
        securityQuestion: '',
        isDeviceShareAvailable: null,
        isSecurityQuestionAvailable: null,
    }),
    actions: {
        async requestOAuthShare(extraQueryParams?: { [key: string]: string }) {
            const { poolId } = useAccountStore();
            const { claim } = useClaimStore();
            const { codeVerifier, codeChallenge } = await generateCodeChallenge();
            const redirectUri = WIDGET_URL + '/signin-popup.html';
            const requestConfig = await getRequestConfig({
                code_challenge: codeChallenge,
                redirect_uri: redirectUri,
                return_url: window.location.href,
                pool_id: poolId,
                claim_id: claim ? claim.uuid : '',
                ...extraQueryParams,
            });

            setSessionState(requestConfig.customState.id, {
                codeVerifier,
                poolId,
                redirectUri,
                returnUrl: window.location.href,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
            });

            await this.triggerLogin(requestConfig);
        },
        async requestOAuthShareRedirectCallback() {
            const url = new URL(window.location.href);
            if (url && !url.searchParams.has('code')) return;

            const stateString = url.searchParams.get('state');
            if (!stateString) return;

            const { id } = JSON.parse(window.atob(stateString.split('%')[0]));
            const session = getSessionState(id);
            const user = await this.getToken(url, session);
            const redirectUri = WIDGET_URL + '/signin-popup.html';

            const requestConfig = {
                verifier: VERIFIER_ID,
                typeOfLogin: 'jwt',
                clientId: CLIENT_ID,
                enableLogging: true,
                uxMode: getUxMode(),
                hash: `#state=${stateString}&access_token=${user.access_token}&id_token=${user.id_token}`,
                queryParameters: window.location.search,
                redirect_uri: redirectUri,
                idToken: user.id_token,
                jwtParams: {
                    domain: AUTH_URL,
                    accessToken: user.access_token,
                    user_info_route: 'me',
                },
            };

            await this.triggerLogin(requestConfig, { state: { id }, refreshToken: user.refresh_token });
        },
        async requestOAuthShareRefresh() {
            if (!this.user || !this.user.refreshToken) return;

            const user = await this.refreshToken(this.user.refreshToken);
            const stateString = (this.user as any)['#state'];

            const requestConfig = {
                verifier: VERIFIER_ID,
                typeOfLogin: 'jwt',
                clientId: CLIENT_ID,
                enableLogging: true,
                uxMode: getUxMode(),
                hash: `#state=${stateString}&access_token=${user.access_token}&id_token=${user.id_token}`,
                queryParameters: new URLSearchParams({ code: '', iss: AUTH_URL, state: stateString } as any).toString(),
                jwtParams: {
                    domain: AUTH_URL,
                    accessToken: user.access_token,
                    idToken: user.id_token,
                    user_info_route: 'me',
                },
            };

            await this.triggerLogin(requestConfig, { refreshToken: user.refresh_token });
        },
        async triggerLogin(requestConfig: any, userInfo?: any) {
            await tKey.serviceProvider.init({ skipSw: true });
            await tKey.modules.securityQuestions.initialize();

            // Trigger login with access and id token hash
            const loginResponse = await tKey.serviceProvider.triggerLogin(requestConfig);

            // Override empty state object in order to do proper removal of session state post sign out
            this.setUser({ ...loginResponse.userInfo, ...userInfo });
            this.oAuthShare = loginResponse.privateKey;

            const { poolId, getConfig } = useAccountStore();
            track('UserSignsIn', [{ sub: loginResponse.userInfo }, { origin: getConfig(poolId).origin, poolId }]);

            await tKey.initialize();
        },
        async getUser() {
            // Set user on storage hit
            const storageKey = `thx.user:${AUTH_URL}:${CLIENT_ID}`;
            const item = localStorage.getItem(storageKey) as string;
            if (!item) return;

            // Validate user token expiry
            this.user = JSON.parse(item);

            if (!this.user) return;
            if (!this.oAuthShare) {
                try {
                    await this.validateToken(this.user.accessToken);
                    await this.requestOAuthShareRefresh();
                } catch (error) {
                    const { signin } = useAccountStore();
                    await signin();
                }
            }
        },
        setUser(userInfo: THXAuthUser) {
            localStorage.setItem(`thx.user:${AUTH_URL}:${CLIENT_ID}`, JSON.stringify(userInfo));
            this.user = userInfo;
        },
        async getPrivateKey() {
            const authStore = useAuthStore();

            if (authStore.oAuthShare) {
                await authStore.getDeviceShare();
                authStore.reconstructKey();
                authStore.getSecurityQuestion();
            }
        },

        async refreshToken(refreshToken: string) {
            try {
                const response = await fetch(AUTH_URL + '/token', {
                    method: 'post',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'refresh_token',
                        refresh_token: refreshToken,
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                    }),
                });
                return await response.json();
            } catch (error) {
                console.error(error);
            }
        },
        async getToken(url: any, session: any) {
            const code = url.searchParams.get('code');
            const iss = url.searchParams.get('iss');
            try {
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
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                    }),
                });
                return await response.json();
            } catch (error) {
                console.error(error);
            }
        },
        async validateToken(accessToken: string) {
            const jwks = jose.createRemoteJWKSet(new URL(AUTH_URL + '/jwks'));
            const { payload } = await jose.jwtVerify(accessToken, jwks, {
                issuer: AUTH_URL,
                audience: CLIENT_ID,
            });
            if (Date.now() > Number(payload.exp) * 1000) {
                throw new Error('token expired');
            }
        },
        async reset() {
            // WARNING Irreversible
            await tKey.storageLayer.setMetadata({
                privKey: this.oAuthShare as any,
                input: { message: 'KEY_NOT_FOUND' },
            });
            const { signout } = useAccountStore();
            await signout();
        },
        async reconstructKey() {
            // Checks the requiredShares to reconstruct the tKey,
            // starts from 2 by default and each of the above share reduce it by one.
            const { requiredShares } = tKey.getKeyDetails();
            if (requiredShares <= 0) {
                const reconstructedKey = await tKey.reconstructKey();
                this.privateKey = reconstructedKey?.privKey.toString('hex');
                console.debug('Successfully reconstructed private key.');
            }
        },
        async getDeviceShare() {
            // Setting the bool will trigger a watcher that displays the recovery modal
            try {
                await tKey.modules.webStorage.inputShareFromWebStorage(); // 2/2 flow
                this.isDeviceShareAvailable = true;
                console.debug('Successfully asserted device share.');
            } catch (e) {
                this.isDeviceShareAvailable = false;
                console.error(e);
            }
        },
        async getSecurityQuestion() {
            try {
                this.securityQuestion = await tKey.modules.securityQuestions.getSecurityQuestions();
                this.isSecurityQuestionAvailable = true;
                console.debug('Successfully got security question.');
            } catch (error) {
                this.isSecurityQuestionAvailable = false;
                console.error(error);
            }
        },
        async createDeviceShare(question: string, answer: string) {
            try {
                await tKey.modules.securityQuestions.generateNewShareWithSecurityQuestions(answer, question);
                console.debug('Successfully generated new share with password.');
                await this.getSecurityQuestion();
            } catch (error) {
                console.debug('Error', (error as any)?.message.toString(), 'error');
            }
        },
        async updateDeviceShare(answer: string, question: string) {
            await tKey.modules.securityQuestions.changeSecurityQuestionAndAnswer(answer, question);
            await this.getSecurityQuestion();
            console.debug('Successfully changed new share with password.');
        },
        async recoverDeviceShare(value: string) {
            await tKey.modules.securityQuestions.inputShareFromSecurityQuestions(value); // 2/2 flow
            await this.reconstructKey();

            const newShare = await tKey.generateNewShare();
            const shareStore = tKey.outputShareStore(newShare.newShareIndex);

            await tKey.modules.webStorage.storeDeviceShare(shareStore);
            await this.getDeviceShare();

            console.debug('Successfully logged you in with the recovery password.');
        },
    },
});

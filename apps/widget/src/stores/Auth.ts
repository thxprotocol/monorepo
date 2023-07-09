import { defineStore } from 'pinia';
import { CLIENT_ID, CLIENT_SECRET, WIDGET_URL, AUTH_URL, VERIFIER_ID, API_URL } from '../config/secrets';
import { useClaimStore } from './Claim';
import { tKey } from '../utils/tkey';
import { useAccountStore } from './Account';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';

const userManager = new UserManager({
    authority: AUTH_URL,
    resource: API_URL,
    response_type: 'code',
    response_mode: 'query',
    redirect_uri: WIDGET_URL + '/signin-popup.html',
    silent_redirect_uri: WIDGET_URL + '/signin-popup.html',
    post_logout_redirect_uri: WIDGET_URL + '/signout-popup.html',
    popup_post_logout_redirect_uri: WIDGET_URL + '/signout-popup.html',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    automaticSilentRenew: false,
    loadUserInfo: false,
    prompt: 'consent',
    scope: 'openid offline_access account:read account:write erc20:read erc721:read erc1155:read point_balances:read referral_rewards:read point_rewards:read wallets:read wallets:write pool_subscription:read pool_subscription:write claims:read',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
});

export const useAuthStore = defineStore('auth', {
    state: (): TAuthState => ({
        user: null,
        userManager: userManager as UserManager,
        privateKey: '',
        oAuthShare: '',
        securityQuestion: '',
        isDeviceShareAvailable: null,
        isSecurityQuestionAvailable: null,
    }),
    actions: {
        async onUserLoadedCallback(user: User) {
            if (!user.access_token || !user.id_token) return;

            const requestConfig = {
                verifier: VERIFIER_ID,
                clientId: CLIENT_ID,
                typeOfLogin: 'jwt',
                enableLogging: false,
                hash: `#state=state&access_token=${user?.access_token}&id_token=${user?.id_token}`,
                queryParameters: new URLSearchParams({ code: '', iss: AUTH_URL, state: 'state' } as any).toString(),
                jwtParams: {
                    domain: AUTH_URL,
                    accessToken: user?.access_token,
                    idToken: user?.id_token,
                    user_info_route: 'me',
                },
            };

            await this.triggerLogin(requestConfig);
        },
        onUserUnloadedCallback() {
            this.oAuthShare = '';
        },
        async requestOAuthShare(extraQueryParams?: { [key: string]: string }) {
            const { poolId, getConfig } = useAccountStore();
            const { origin } = getConfig(poolId);
            const { claim } = useClaimStore();
            const returnUrl = window.location.href;
            const isMobile = window.matchMedia('(pointer:coarse)').matches;

            this.user = await this.userManager[isMobile ? 'signinRedirect' : 'signinPopup']({
                state: {
                    isMobile,
                    returnUrl,
                    client_id: CLIENT_ID,
                    origin,
                },
                extraQueryParams: {
                    return_url: returnUrl,
                    pool_id: poolId,
                    claim_id: claim ? claim.uuid : '',
                    ...extraQueryParams,
                },
            });
        },
        async requestOAuthShareRefresh() {
            const { poolId, getConfig } = useAccountStore();
            const { origin } = getConfig(poolId);

            this.user = await this.userManager.signinSilent({
                state: {
                    returnUrl: window.location.href,
                    client_id: CLIENT_ID,
                    origin,
                },
            });
        },
        async triggerLogin(requestConfig: any) {
            await tKey.serviceProvider.init({ skipSw: true });
            await tKey.modules.securityQuestions.initialize();

            // Trigger login with access and id token hash
            const loginResponse = await tKey.serviceProvider.triggerLogin(requestConfig);

            // Override empty state object in order to do proper removal of session state post sign out
            this.oAuthShare = loginResponse.privateKey;

            await tKey.initialize();
        },
        async getUser() {
            // Validate user token expiry
            this.user = await this.userManager.getUser();
            if (!this.user) return;
            if (this.oAuthShare) return;

            await this.requestOAuthShareRefresh();
        },
        async getPrivateKey() {
            if (!this.oAuthShare) return;
            await this.getDeviceShare();
            this.reconstructKey();
            this.getSecurityQuestion();
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

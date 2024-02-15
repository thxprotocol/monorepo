import { defineStore } from 'pinia';
import { track } from '@thxnetwork/mixpanel';
import { THXBrowserClient } from '@thxnetwork/sdk';
import { API_URL, AUTH_URL, WIDGET_URL } from '../config/secrets';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS, getStyles } from '../utils/theme';
import { BREAKPOINT_LG } from '../config/constants';
import { useWalletStore } from './Wallet';
import { useAuthStore } from './Auth';
import { getConnectionStatus } from '../utils/social';
import { AccessTokenKind } from '../types/enums/accessTokenKind';
import { User } from 'oidc-client-ts';
import { AccountVariant } from '../types/enums/accountVariant';
import { decodeHTML } from '../utils/decode-html';
import poll from 'promise-poller';

// Feature only available on mobile devices
const isMobileDevice = !!window.matchMedia('(pointer:coarse)').matches;

export const useAccountStore = defineStore('account', {
    state: (): TAccountState => ({
        poolId: '',
        isPreview: false,
        api: null,
        account: null,
        balance: 0,
        config: {},
        css: null,
        subscription: null,
        leaderboard: [],
        participants: [],
        windowHeight: 0,
        isSidebarShown: false,
        isAuthenticated: null,
        isModalAccountShown: false,
        isModalWalletShown: false,
        isIFrame: window.top !== window.self,
        isMobile: window.innerWidth < BREAKPOINT_LG,
        isMobileDevice: isMobileDevice,
        isMobileIFrame: window.top !== window.self && isMobileDevice,
        isMobileEthereumBrowser: window.ethereum && isMobileDevice,
    }),
    actions: {
        setConfig(poolId: string, config: TWidgetConfig) {
            this.poolId = poolId;
            this.config = { ...this.config, ...config };
        },
        setTheme(config: TWidgetConfig) {
            const { title, theme } = config;
            const { elements, colors } = JSON.parse(theme);
            const css = getStyles(elements, colors);
            document.title = decodeHTML(title) as string;
            this.css = document.head.appendChild(css);
        },
        reset() {
            this.poolId = '';
            this.api.setCampaignId('');
            this.setTheme({
                title: 'THX Network',
                theme: JSON.stringify({ elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS }),
            } as TWidgetConfig);
            this.config = {};
        },
        getTheme() {
            return JSON.parse(this.config.theme);
        },
        async init(slug: string, origin: string) {
            if (!this.api) {
                this.api = new THXBrowserClient({
                    apiUrl: API_URL,
                    authUrl: AUTH_URL,
                } as any);
                this.addEventListeners();
                this.setStatus(false);
                this.getUserData();
            }

            if (slug) {
                const config = await this.api.request.get('/v1/widget/' + slug);
                this.poolId = config.poolId;
                this.api.setCampaignId(this.poolId);

                this.setConfig(config.poolId, { ...config, origin });
                this.setTheme(config);
                this.getCampaignData();

                if (window.top === window.self) {
                    track('UserOpens', [
                        this.account?.sub || '',
                        `widget iframe`,
                        { origin: this.config.origin, poolId: this.poolId, isShown: true },
                    ]);
                }
            }
        },
        onLoad() {
            // debugger;
        },
        onResize() {
            this.isMobile = window.innerWidth < BREAKPOINT_LG;
            this.windowHeight = window.innerHeight;
        },
        addEventListeners() {
            const authStore = useAuthStore();

            authStore.userManager.events.addUserLoaded(this.onUserLoaded);
            authStore.userManager.events.addUserUnloaded(this.onUserUnloaded);
            authStore.userManager.events.load(this.onLoad);
            authStore
                .getUser()
                .then(() => {
                    if (!authStore.user) {
                        this.setStatus(null);
                    }
                })
                .catch((error) => {
                    this.setStatus(null);
                    console.log(error);
                });
        },
        async onUserLoaded(user: User) {
            const authStore = useAuthStore();
            if (user.access_token) {
                this.api.request.setUser(user);
                await this.connectIdentity();
            }

            await authStore.onUserLoadedCallback(user);

            this.getUserData();
            this.getCampaignData();
        },
        onUserUnloaded() {
            return useAuthStore().onUserUnloadedCallback();
        },
        async getAccount() {
            this.account = await this.api.request.get('/v1/account');
        },
        async getParticipants() {
            const params: { poolId?: string } = {};
            if (this.poolId) params['poolId'] = this.poolId;
            this.participants = await this.api.request.get('/v1/participants', { params });
        },
        async subscribe() {
            const email = this.account?.email;
            if (!email) return;

            this.subscription = await this.api.pools.subscription.post({ poolId: this.poolId, email });

            track('UserCreates', [
                this.account?.sub,
                'pool subscription',
                { poolId: this.poolId, origin: this.config.origin },
            ]);
        },
        async unsubscribe() {
            try {
                await this.api.pools.subscription.delete(this.poolId);
            } catch (error) {
                // No-op as delete is throwing due to missing json response (not a problem though)
            }
            this.subscription = null;

            track('UserCreates', [
                this.account?.sub,
                'pool unsubscription',
                { poolId: this.poolId, origin: this.config.origin },
            ]);
        },
        async getSubscription() {
            this.subscription = await this.api.pools.subscription.get(this.poolId);
        },
        connect(kind: AccessTokenKind, scopes: TOAuthScope[]) {
            return useAuthStore().requestOAuthShare({
                prompt: 'connect',
                access_token_kind: kind,
                provider_scope: scopes.join(' '),
            });
        },
        disconnect(kind: AccessTokenKind) {
            return this.api.request.post('/v1/account/disconnect', { data: { kind } });
        },
        waitForConnectionStatus(kind: AccessTokenKind, scopes: TOAuthScope[]) {
            const taskFn = async () => {
                if (!this.account) return;
                await this.getAccount();
                return getConnectionStatus(this.account, kind, scopes)
                    ? Promise.resolve()
                    : Promise.reject('Could no validate connection status...');
            };
            return poll({
                taskFn,
                interval: 3000,
                retries: 20, // 3s * 20 = 60s
            });
        },
        signinParent() {
            const url = `${WIDGET_URL}/c/${this.config.slug}/signin`;
            this.postMessage({ message: 'thx.auth.signin', url });
        },
        signin(extraQueryParams?: { [key: string]: string }) {
            this.setStatus(false);
            if (this.isMobileIFrame) {
                this.signinParent();
            } else {
                useAuthStore().requestOAuthShare(extraQueryParams);
            }
        },
        async signout() {
            const { signout } = useAuthStore();
            await signout();

            this.setStatus(null);
            this.account = null;
        },
        async getCampaignData() {
            if (!this.poolId || !useAuthStore().oAuthShare) return;

            this.getSubscription();
        },
        async getUserData() {
            const walletStore = useWalletStore();
            const authStore = useAuthStore();

            // Guard HTTP requests that do require auth
            if (!authStore.oAuthShare) return;

            this.getParticipants();
            await this.getAccount();

            if (this.account && this.account.variant !== AccountVariant.Metamask) {
                authStore.getPrivateKey();
            }

            await walletStore.getWallet();
            walletStore.list();

            this.setStatus(true);
        },
        setStatus(isAuthenticated: boolean | null) {
            this.isAuthenticated = isAuthenticated;
            this.postMessage({ message: 'thx.auth.status', isAuthenticated });

            if (isAuthenticated) {
                track('UserSignsIn', [this.account, { origin, poolId: this.poolId }]);
            }
        },
        postMessage(payload: any) {
            if (this.config.origin && window.self !== window.top) {
                window.top?.postMessage(payload, this.config.origin);
            }
        },
        async updateAccountAddress() {
            const authStore = useAuthStore();
            if (!authStore.privateKey) return;

            // Patch the account with the MPC address
            const authRequestMessage = 'validate_account_address_ownership';
            const authRequestSignature = await authStore.sign(authRequestMessage);
            await this.update({ authRequestMessage, authRequestSignature });
            if (this.account) this.account.address = authStore.wallet.address;
        },
        async update(
            payload: Partial<{
                username: string;
                email: string;
                profileImg: string;
                authRequestMessage: string;
                authRequestSignature: string;
            }>,
        ) {
            await this.api.account.patch(payload);
            this.account = { ...this.account, ...(payload as any) };
        },
        async upload(file: File) {
            const body = new FormData();
            body.append('file', file);

            const { publicUrl } = await this.api.request.put('/v1/upload', {
                headers: {
                    'Content-Type': undefined,
                },
                data: body,
            });
            return publicUrl;
        },
        async connectIdentity() {
            const identity = this.getIdentity();
            if (!identity) return;

            try {
                await this.api.request.patch(`/v1/identity/${identity}`);
                window.sessionStorage.removeItem(`thx:${this.poolId}:id`);
            } catch (error) {
                console.error(error);
            }
        },
        storeIdentity(identity: string) {
            window.sessionStorage.setItem(`thx:${this.poolId}:id`, identity);
        },
        getIdentity() {
            return window.sessionStorage.getItem(`thx:${this.poolId}:id`);
        },
        async getLeaderboard() {
            const leaderboard = await this.api.request.get(`/v1/leaderboards/${this.poolId}`);
            this.leaderboard = leaderboard;
        },
    },
});

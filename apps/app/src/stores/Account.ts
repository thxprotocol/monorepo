import { defineStore } from 'pinia';
import { track } from '@thxnetwork/common/mixpanel';
import { THXBrowserClient } from '@thxnetwork/sdk/clients';
import { API_URL, AUTH_URL, CLIENT_ID, WIDGET_URL } from '../config/secrets';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS, getStyles } from '../utils/theme';
import { BREAKPOINT_LG } from '../config/constants';
import { useAuthStore } from './Auth';
import { getConnectedUser } from '../utils/social';
import { AccessTokenKind } from '../types/enums/accessTokenKind';
import { User } from 'oidc-client-ts';
import { decodeHTML } from '../utils/decode-html';
import poll from 'promise-poller';
import { useWalletStore } from './Wallet';

// Feature only available on mobile devices
const isMobileDevice = !!window.matchMedia('(pointer:coarse)').matches;

export const useAccountStore = defineStore('account', {
    state: (): TAccountState => ({
        poolId: '',
        isPreview: false,
        api: null,
        account: null,
        invite: null,
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
        setGlobals(config: { activeWalletId: string }) {
            config = { ...this.globals(), ...config };
            const storageString = JSON.stringify(config);
            localStorage.setItem('thx:app:config', storageString);
        },
        globals(): Partial<TAccountGlobals> {
            const storedString = localStorage.getItem('thx:app:config');
            if (!storedString) return {};
            return JSON.parse(storedString);
        },
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
        async getInvite(code: string) {
            if (this.invite && this.invite.code.code === code) return;
            this.invite = await this.api.request.get(`/v1/invites/${code}`);
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

            if (!slug) return;

            const config = await this.api.request.get('/v1/widget/' + slug);
            this.poolId = config.poolId;
            this.api.setCampaignId(this.poolId);

            this.setConfig(config.poolId, { ...config, origin });
            this.setTheme(config);

            // Disabled to save credits on high volume campaigns
            // track('UserVisits', [this.account?.sub, slug, { poolId: this.poolId }]);
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
            // Set user in API SDK
            if (user.access_token) {
                useAuthStore().onUserLoadedCallback(user);
                this.api.request.setUser(user);
                await this.getAccount();
                track('UserSignsIn', [this.account, { poolId: this.poolId }]);

                this.connectIdentity();
            }

            this.getUserData();
        },
        onUserUnloaded() {
            return useAuthStore().onUserUnloadedCallback();
        },
        isSubscribed(id: string) {
            return this.participants.find((p) => p.poolId === id)?.isSubscribed;
        },
        async getAccount() {
            this.account = await this.api.request.get('/v1/account');
            if (
                this.account &&
                (!this.account.username || this.account.profileImg.startsWith('https://api.dicebear.com'))
            ) {
                this.isModalAccountShown = true;
            }
        },
        async getParticipants(poolId?: string) {
            const params: { poolId?: string } = {};
            if (poolId) params['poolId'] = poolId;
            if (this.poolId) params['poolId'] = this.poolId;

            this.participants = await this.api.request.get('/v1/participants', { params });
        },
        async updateParticipant({ email, isSubscribed }: Partial<TParticipant> & { email: string }) {
            const participant = this.participants.find((p) => p.poolId === this.poolId);
            if (!participant) return;

            await this.api.request.patch(`/v1/participants/${participant._id}`, {
                data: { isSubscribed, email },
            });

            this.getParticipants();

            // If isSubscribed is a boolean, then track the event
            if (typeof isSubscribed === 'boolean') {
                track('UserCreates', [
                    this.account?.sub,
                    isSubscribed ? 'pool subscription' : 'pool unsubscription',
                    { poolId: this.poolId },
                ]);
            }
        },
        connect(kind: AccessTokenKind, scopes: TOAuthScope[]) {
            return useAuthStore().signin({
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
                return getConnectedUser(this.account, kind, scopes)
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
                useAuthStore().signin(extraQueryParams);
            }
        },
        async verifyEmail(token: string, returnUrl: string) {
            const { userManager } = useAuthStore();
            await userManager.signinRedirect({
                state: {
                    isMobile: isMobileDevice,
                    returnUrl,
                    client_id: CLIENT_ID,
                    origin: this.config.origin,
                },
                extraQueryParams: {
                    prompt: 'verify_email',
                    pool_id: this.poolId,
                    return_url: returnUrl,
                    verifyEmailToken: token,
                },
            });
        },
        async signout() {
            const walletStore = useWalletStore();
            const { signout } = useAuthStore();
            walletStore.wallet = null;
            await walletStore.disconnect();
            await signout();
            this.setStatus(null);
            this.account = null;
        },
        async getUserData() {
            const { user } = useAuthStore();
            this.setStatus(!!user);
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
            this.leaderboard = await this.api.request.get(`/v1/leaderboards/${this.poolId}`);
        },
        async waitForJob(jobId: string) {
            const taskFn = async () => {
                const job = await this.api.request.get(`/v1/jobs/${jobId}`);
                return job && !!job.lastFinishedAt ? Promise.resolve() : Promise.reject('Job not finished');
            };

            // Poll for job to finish
            await poll({ taskFn, interval: 1000, retries: 60 });
        },
    },
});

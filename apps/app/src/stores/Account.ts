import { API_URL, AUTH_URL, SUPABASE_PUBLIC_KEY, SUPABASE_URL, WIDGET_URL } from '../config/secrets';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS, getStyles } from '../utils/theme';
import { defineStore } from 'pinia';
import { track } from '@thxnetwork/app/utils/mixpanel';
import { AccountVariant } from '@thxnetwork/common/enums';
import { THXBrowserClient } from '@thxnetwork/sdk/clients';
import { BREAKPOINT_LG } from '../config/constants';
import { useAuthStore } from './Auth';
import { accountVariantProviderKindMap, OAuthScopes } from '../utils/social';
import { AccessTokenKind } from '../types/enums/accessTokenKind';
import { decodeHTML } from '../utils/decode-html';
import { useWalletStore } from './Wallet';
import { AuthChangeEvent, createClient, Provider, Session } from '@supabase/supabase-js';
import { popup } from '../utils/popup';
import poll from 'promise-poller';

// Feature only available on mobile devices
const isMobileDevice = !!window.matchMedia('(pointer:coarse)').matches;

// Create Supabase client for authentication
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export const useAccountStore = defineStore('account', {
    state: (): TAccountState => ({
        session: null,
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
        isNavbarOffcanvasShown: false,
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
            this.participants = [];
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
            // If the SDK is not initialized, then initialize it and start listening for auth events
            if (!this.api) {
                this.api = new THXBrowserClient({
                    apiUrl: API_URL,
                    authUrl: AUTH_URL,
                } as any);

                const authEventMap: { [event: string]: ((session: Session | null) => Promise<void>) | null } = {
                    SIGNED_IN: this.onSignedIn,
                    SIGNED_OUT: this.onSignedOut,
                };

                // Listen for supabase auth events
                supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
                    const fn = authEventMap[event];
                    if (fn) fn(session);
                });
            }

            // If no slug is provided we're not on a campaign page so we return early
            if (!slug) return;

            const config = await this.api.request.get('/v1/widget/' + slug);
            this.poolId = config.poolId;
            this.api.setCampaignId(this.poolId);

            this.setConfig(config.poolId, { ...config, origin });
            this.setTheme(config);
        },
        async onSignedIn(session: Session | null) {
            if (session) await this.setSession(session);
            this.setStatus(!!session);
        },
        async onSignedOut() {
            this.setStatus(false);
            this.account = null;
            this.isNavbarOffcanvasShown = false;
        },
        async setSession(session: Session | null) {
            this.api.request.setUser(session);
            if (session) {
                if (!this.account) await this.getAccount();
                useAuthStore().isModalLoginShown = false;
                this.isNavbarOffcanvasShown = false;
                this.session = session;
            }
        },
        onResize() {
            this.isMobile = window.innerWidth < BREAKPOINT_LG;
            this.windowHeight = window.innerHeight;
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
        async connect(kind: AccessTokenKind, scopes: TOAuthScope[]) {
            try {
                const data = await this.api.request.get('/v1/oauth/authorize/' + kind, {
                    params: {
                        scopes: scopes.map((scope) => encodeURIComponent(scope)).join(','),
                        returnTo: WIDGET_URL + '/auth/redirect',
                    },
                });
                if (!data.url) throw new Error('Could not get authorize URL');
                popup.open(data.url);

                await this.waitForToken({ kind, scopes });
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        async disconnect(kind: AccessTokenKind) {
            try {
                await this.api.request.delete('/v1/account/disconnect/' + kind);
                await this.waitForToken({ kind, scopes: [] });
            } catch (error) {
                console.error(error);
            }
        },
        async waitForToken({ kind, scopes }: { kind: AccessTokenKind; scopes: TOAuthScope[] }) {
            return new Promise((resolve, reject) => {
                const poll = async () => {
                    await this.getAccount();

                    if (!this.account) {
                        setTimeout(poll, 1000);
                        return reject('account_not_found');
                    }

                    const isAuthorized = this.account.tokens.find(
                        (token) => token.kind === kind && scopes.every((scope) => token.scopes.includes(scope)),
                    );
                    if (!isAuthorized) setTimeout(poll, 1000);

                    return isAuthorized ? resolve('') : reject('token_invalid');
                };
                poll();
            });
        },
        async signinWithWallet(address: string, { message, signature }: { message: string; signature: string }) {
            const { password } = await this.api.request.post('/v1/login/pwd', { data: { message, signature } });
            const { error } = await this._signinWithPassword({ address, password });
            if (error) throw error;
        },
        async _signinWithPassword({ address, password }: { address: string; password: string }) {
            try {
                // Try to get the user with the address and password
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: `${address}@thx.network`,
                    password,
                });
                // If we find a user for these credentials then login
                if (data.user) return { data, error };
                // If we are noticed that we login using the wrong credentials then we try to signup
                if (error && error.message === 'Invalid login credentials') {
                    return await this._signupWithPassword({ address, password });
                }
                // If it was a different error we rethrow
                if (error) throw error;

                // In all other cases we throw an unknown error
                throw new Error('Unknown error');
            } catch (error) {
                return { data: null, error };
            }
        },
        async _signupWithPassword({ address, password }: { address: string; password: string }) {
            try {
                // If no user is found for this address and password then create a new user
                const { data, error } = await supabase.auth.signUp({
                    email: `${address}@thx.network`,
                    password,
                    options: { data: { variant: AccountVariant.Metamask, address } },
                });
                if (error && error.message === 'User already registered') {
                    throw new Error('Unable to sign you in.');
                }
                if (error) throw error;
                return { data, error };
            } catch (error) {
                return { data: null, error };
            }
        },
        async signInWithOtp({ email }: { email: string }) {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    data: {
                        variant: AccountVariant.EmailPassword,
                    },
                    shouldCreateUser: true, // We create users in supabase if they don't exist
                },
            });
            if (error) throw new Error(error.message);
        },
        async verifyOtp({ email, token }: { email: string; token: string }) {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email',
            });
            if (error) throw new Error(error.message);
        },
        async signInWithOAuth({ variant }: { variant: AccountVariant }) {
            const provider = accountVariantProviderKindMap[variant] as Provider;
            if (!provider) throw new Error('Requested provider not available.');

            const config = this._getOAuthConfig(provider, {
                redirectTo: WIDGET_URL + '/auth/redirect',
                scopes: OAuthScopes[provider],
            });
            const { data, error } = await supabase.auth.signInWithOAuth(config);
            if (error) throw new Error(error.message);

            popup.open(data.url);
        },
        _getOAuthConfig(
            provider: Provider,
            options: {
                redirectTo: string;
                scopes: TOAuthScope[];
            },
        ) {
            return {
                provider,
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    ...options,
                    skipBrowserRedirect: true,
                    scopes: options.scopes.join(' '),
                },
            };
        },
        async signout() {
            const walletStore = useWalletStore();
            walletStore.wallet = null;
            await walletStore.disconnect();
            await supabase.auth.signOut();
        },
        setStatus(isAuthenticated: boolean) {
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
            if (!this.poolId) return;
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

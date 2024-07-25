import { API_URL, AUTH_URL, SUPABASE_PUBLIC_KEY, SUPABASE_URL, WIDGET_URL } from '../config/secrets';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS, getStyles } from '../utils/theme';
import { defineStore } from 'pinia';
import { track } from '@thxnetwork/common/mixpanel';
import { AccountVariant } from '@thxnetwork/common/enums';
import { THXBrowserClient } from '@thxnetwork/sdk/clients';
import { BREAKPOINT_LG } from '../config/constants';
import { useAuthStore } from './Auth';
import { accountVariantProviderKindMap, kindAccountVariantMap, OAuthScopes } from '../utils/social';
import { AccessTokenKind } from '../types/enums/accessTokenKind';
import { decodeHTML } from '../utils/decode-html';
import { useWalletStore } from './Wallet';
import { createClient, Provider, Session, UserIdentity } from '@supabase/supabase-js';
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
        identities: [],
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
            if (!this.api) {
                this.api = new THXBrowserClient({
                    apiUrl: API_URL,
                    authUrl: AUTH_URL,
                } as any);
                this.setSupabaseAuthListener();
            }

            if (!slug) return;

            const config = await this.api.request.get('/v1/widget/' + slug);
            this.poolId = config.poolId;
            this.api.setCampaignId(this.poolId);

            this.setConfig(config.poolId, { ...config, origin });
            this.setTheme(config);
        },
        setSupabaseAuthListener() {
            supabase.auth.onAuthStateChange(async (event, session) => {
                console.debug(event, !!session);
                if (event === 'INITIAL_SESSION') {
                    if (session) await this.setSession(session);
                    this.setStatus(!!session);
                } else if (event === 'SIGNED_IN') {
                    if (session) {
                        await this.setSession(session);
                        this.identities = session.user ? session.user.identities : [];
                    }
                    this.setStatus(!!session);
                } else if (event === 'SIGNED_OUT') {
                    this.setStatus(false);
                    this.account = null;
                    this.identities = [];
                } else if (event === 'PASSWORD_RECOVERY') {
                    // handle password recovery event
                } else if (event === 'TOKEN_REFRESHED') {
                    // handle token refreshed event
                } else if (event === 'USER_UPDATED') {
                    // handle user updated event
                }
            });
        },
        async setSession(session: Session | null) {
            this.api.request.setUser(session);
            if (session) {
                if (!this.account) await this.getAccount();
                useAuthStore().isModalLoginShown = false;
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
            const variant = kindAccountVariantMap[kind];
            const provider = accountVariantProviderKindMap[variant] as Provider;
            if (!provider) throw new Error('Requested provider not available.');

            const config = this._getOAuthConfig(provider, {
                scopes,
                skipBrowserRedirect: true,
                redirectTo: WIDGET_URL + '/auth/redirect',
            });
            const { data, error } = await supabase.auth.linkIdentity(config);
            if (error) throw error;
            if (config.options.skipBrowserRedirect) {
                popup.open(data.url);
            }
        },
        async disconnect(kind: AccessTokenKind) {
            const identity = await this._getSupabaseIdentity(kind);
            await supabase.auth.unlinkIdentity(identity);
            await this.getSupabaseIdentities();
        },
        async getSupabaseIdentities() {
            const { data, error } = await supabase.auth.getUserIdentities();
            if (error) throw error;
            this.identities = data.identities;
        },
        async _getSupabaseIdentity(kind: AccessTokenKind) {
            await this.getSupabaseIdentities();
            const identity = this.identities.find((i: UserIdentity) => i.provider === kind);
            if (!identity) throw new Error('Identity not found');
            return identity;
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
                    options: { data: { address } },
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
            const redirectTo = this.isIFrame ? WIDGET_URL + '/auth/redirect' : window.location.href;
            const config = this._getOAuthConfig(provider, {
                scopes: OAuthScopes[provider],
                redirectTo,
                skipBrowserRedirect: this.isIFrame,
            });
            const { data, error } = await supabase.auth.signInWithOAuth(config);
            if (error) throw new Error(error.message);

            // When the app is loaded in an iframe we need to break out of the iframe
            // to continue the OAuth flow since social providers do not allow access from iframes
            if (this.isIFrame) {
                popup.open(data.url);
            }
        },
        async signout() {
            const walletStore = useWalletStore();
            walletStore.wallet = null;
            await walletStore.disconnect();
            await supabase.auth.signOut();
        },
        _getOAuthConfig(
            provider: Provider,
            options: { scopes: TOAuthScope[]; skipBrowserRedirect: boolean; redirectTo: string },
        ) {
            return {
                provider,
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    ...options,
                    scopes: options.scopes.join(' '),
                },
            };
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

import { createClient, Provider, Session } from '@supabase/supabase-js';
import { AccountVariant } from '@thxnetwork/common/enums';
import { defineStore } from 'pinia';
import { accountVariantProviderKindMap, OAuthScopes } from '../config/constants';
import { API_URL, SUPABASE_PUBLIC_KEY, SUPABASE_URL } from '../config/secrets';
import router from '../router';
import { popup } from '../utils/popup';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

const supabaseAuthEventMap: any = {
    SIGNED_IN: async (session: Session) => useAuthStore().onSignedIn(session),
    SIGNED_OUT: (session: Session) => useAuthStore().onSignedOut(session),
};

supabase.auth.onAuthStateChange(async (event, session) => {
    const fn = supabaseAuthEventMap[event];
    if (fn) await fn(session);
});

export const useAuthStore = defineStore('auth', {
    state: () => ({
        session: null as null | Session,
    }),
    getters: {
        isAuthenticated(state) {
            return !!state.session && state.session.expires_in > 0;
        },
    },
    actions: {
        async request(path: string, options?: TRequestOptions) {
            // Return if not authenticated
            if (!this.isAuthenticated) {
                await router.push({ name: 'login' });
                return;
            }

            const url = new URL(API_URL);
            url.pathname = `/v1${path}`;
            if (options?.params) {
                for (const key in options.params) {
                    url.searchParams.append(key, options.params[key]);
                }
            }

            const response = await fetch(url.toString(), {
                method: 'GET',
                ...options,
                ...(options && options.body ? { body: JSON.stringify(options.body) } : {}),
                headers: {
                    'Authorization': `Bearer ${this.session?.access_token}`,
                    'Content-Type': 'application/json',
                    ...(options && options.headers),
                },
            });

            try {
                return await response.json();
            } catch (error) {
                //
            }
        },
        async getSession() {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw new Error(error.message);
            return data.session;
        },
        onSignedIn(session: Session) {
            const isExpired = session?.expires_at ? new Date(session.expires_at * 1000) < new Date() : false;
            if (!session || isExpired) return;
            this.session = session;

            // On login and signup page we redirect to redirect url or dashboard if an account is found
            const route = router.currentRoute.value;
            if (['login'].includes(route.name as string)) {
                if (route.query.redirect) {
                    router.push({ path: route.query.redirect as string });
                } else {
                    router.push({ name: 'collections' });
                }
            }
        },
        async onSignedOut(_session: Session) {
            this.session = null;
            await router.push({ name: 'login' });
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

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: window.location.origin + '/auth/redirect',
                    scopes: OAuthScopes[provider].join(' '),
                    skipBrowserRedirect: true,
                },
            });
            if (error) throw new Error(error.message);

            popup.open(data.url);
        },
        async logout() {
            await supabase.auth.signOut();
        },
    },
});

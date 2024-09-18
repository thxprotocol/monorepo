import { defineStore } from 'pinia';
import { createClient, Provider, Session } from '@supabase/supabase-js';
import { API_URL, STUDIO_URL, SUPABASE_PUBLIC_KEY, SUPABASE_URL } from '../config/secrets';
import { accountVariantProviderKindMap, OAuthScopes } from '../config/constants';
import { AccountVariant } from '@thxnetwork/common/enums';
import { popup } from '../utils/popup';
import router from '../router';

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
    actions: {
        async request(path: string, options?: TRequestOptions) {
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
        onSignedOut(_session: Session) {
            this.session = null;
            router.push({ name: 'login' });
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
                redirectTo: window.location.origin + '/auth/redirect',
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
        async logout() {
            await supabase.auth.signOut();
        },
    },
});

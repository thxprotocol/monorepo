import { createClient, Provider, Session } from '@supabase/supabase-js';
import { AccountVariant } from '@thxnetwork/common/enums';
import { defineStore } from 'pinia';
import { useAccountStore, useWalletStore } from '.';
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
        isModalLoginShown: false,
    }),
    getters: {
        isAuthenticated(state) {
            return !!state.session && state.session.expires_in > 0;
        },
    },
    actions: {
        async request(path: string, options?: TRequestOptions) {
            // Return if not authenticated
            if (!this.isAuthenticated && options?.isAuthenticated) {
                throw new Error('Login required!');
            }

            // Create URL and append params
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
                // If the response is not JSON, we return undefined
                return;
            }
        },
        async getSession() {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw new Error(error.message);
            return data.session;
        },
        async onSignedIn(session: Session) {
            const isExpired = session?.expires_at ? new Date(session.expires_at * 1000) < new Date() : false;
            if (!session || isExpired) return;
            this.session = session;

            await useAccountStore().get();
            useWalletStore().list();

            this.isModalLoginShown = false;
        },
        onSignedOut(_session: Session) {
            this.session = null;
            router.push({ name: 'wallet' });
        },
        onMessage(event: MessageEvent) {
            const { message, session } = event.data;
            switch (message) {
                case 'tws.auth.callback':
                    this.onSignedIn(session);
                    break;
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
        async signinWithWallet(address: `0x${string}`, { message, signature }: { message: string; signature: string }) {
            const { password } = await this.request('/login/pwd', { method: 'POST', body: { message, signature } });
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
        async logout() {
            await supabase.auth.signOut();
        },
    },
});

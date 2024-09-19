import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';

export const useAccountStore = defineStore('account', {
    state: () => ({
        account: null as null | TAccount,
        profiles: [] as TWidget[],
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async get() {
            this.account = await this.request('/account');
        },
        async getProfiles() {
            this.profiles = await this.request('/widgets');
        },
        async updateProfile(profileId: string, profile: Partial<TWidget>) {
            await this.request(`/widgets/${profileId}`, {
                method: 'PATCH',
                body: profile,
            });
        },
    },
});

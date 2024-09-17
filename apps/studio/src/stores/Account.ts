import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';

export const useAccountStore = defineStore('account', {
    state: () => ({
        account: null as null | TAccount,
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async get() {
            this.account = await this.request('/account');
        },
    },
});

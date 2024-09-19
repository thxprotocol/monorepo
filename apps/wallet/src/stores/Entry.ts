import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';

export const useEntryStore = defineStore('entry', {
    state: () => ({
        entry: null as null | TQRCodeEntry,
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async get(uuid: string) {
            const response = await this.request('/qr-codes/' + uuid);
            this.entry = response;
        },
    },
});
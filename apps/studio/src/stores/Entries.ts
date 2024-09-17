import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';

export const useEntryStore = defineStore('entry', {
    state: () => ({
        entries: {
            total: 0,
            limit: 0,
            page: 0,
            results: [] as TQRCodeEntry[],
            meta: {
                participantCount: 0,
            },
        },
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async list(options: { page: number; limit: number; query: string }) {
            const params = new URLSearchParams();
            params.set('page', String(options.page));
            params.set('limit', String(options.limit));
            params.set('query', String(options.query));

            this.entries = await this.request('/qr-codes');
        },
    },
});

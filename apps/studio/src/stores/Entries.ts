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
            this.entries = await this.request('/qr-codes', { params: options });
        },
        async create(body: { erc721Id: string; erc721MetadataId: string; amount: number; redirectURL: string }) {
            const { request } = useAuthStore();
            await request(`/qr-codes`, { method: 'POST', body });
        },
        async remove(id: string) {
            await this.request(`/qr-codes/${id}`, { method: 'DELETE' });
            this.entries.results = this.entries.results.filter((entry) => entry._id !== id);
        },
    },
});

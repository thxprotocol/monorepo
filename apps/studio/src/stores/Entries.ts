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
        entriesByMetadata: {} as Record<
            string,
            {
                total: number;
                limit: number;
                page: number;
                results: TQRCodeEntry[];
                meta: Record<string, number>;
            }
        >,
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async list(options: { page: number; limit: number; query: string; erc721MetadataId?: string }) {
            const data = await this.request('/qr-codes', { params: options });
            if (options.erc721MetadataId) {
                this.entriesByMetadata[options.erc721MetadataId] = data;
            } else {
                this.entries = data;
            }
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

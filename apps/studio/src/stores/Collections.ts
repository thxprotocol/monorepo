import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';

export const useCollectionStore = defineStore('collection', {
    state: () => ({
        collections: [] as TERC721[],
        metadata: {} as Record<
            string,
            {
                total: number;
                results: TERC721Metadata[];
            }
        >,
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async list() {
            const data = await this.request('/erc721');
            this.collections = await Promise.all(
                data.map(async (id: string) => {
                    return await this.request(`/erc721/${id}`);
                }),
            );
        },
        async get(id: string) {
            const data = await this.request(`/erc721/${id}`);
            const index = this.collections.findIndex((collection) => collection._id === id);
            this.collections[index >= 0 ? index : this.collections.length] = data;
        },
        async create(body: Partial<TERC721>) {
            const data = await this.request(`/erc721`, { method: 'POST', body, params: {} });
            this.collections.push(data);
        },
        async listMetadata(erc721Id: string, options: { page: number; limit: number }) {
            const params = new URLSearchParams();
            params.set('page', String(options.page));
            params.set('limit', String(options.limit));

            const data = await this.request(`/erc721/${erc721Id}/metadata`, { params });
            this.metadata[erc721Id] = data;
        },
    },
});

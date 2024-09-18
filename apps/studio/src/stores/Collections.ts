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
        async remove(id: string) {
            await this.request(`/erc721/${id}`, { method: 'DELETE' });
            this.collections = this.collections.filter((collection) => collection._id !== id);
        },
        async listMetadata(erc721Id: string, params: { page: number; limit: number }) {
            const data = await this.request(`/erc721/${erc721Id}/metadata`, { params });
            this.metadata[erc721Id] = data;
        },
        async createMetadata(erc721Id: string, body: Partial<TERC721Metadata>) {
            const data = await this.request(`/erc721/${erc721Id}/metadata`, { method: 'POST', body });
            this.metadata[erc721Id].results.push(data);
        },
        async removeMetadata(erc721Id: string, erc721MetadataId: string) {
            await this.request(`/erc721/${erc721Id}/metadata/${erc721MetadataId}`, { method: 'DELETE' });
            this.metadata[erc721Id].results = this.metadata[erc721Id].results.filter(
                (metadata) => metadata._id !== erc721MetadataId,
            );
        },
    },
});

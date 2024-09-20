import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';
import { useWalletStore } from '.';

export const useEntryStore = defineStore('entry', {
    state: () => ({
        entry: null as null | TQRCodeEntry,
        erc721: null as null | TERC721,
        metadata: null as null | TERC721Metadata,
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async get(uuid: string) {
            const { entry, metadata, erc721 } = await this.request('/qr-codes/' + uuid);

            this.entry = entry;
            this.erc721 = erc721;
            this.metadata = metadata;
        },
        async collect(uuid: string) {
            const { wallet } = useWalletStore();
            if (!wallet) throw new Error('Wallet not found');

            await this.request(`/qr-codes/${uuid}`, { method: 'PATCH', params: { walletId: wallet._id } });
        },
    },
});

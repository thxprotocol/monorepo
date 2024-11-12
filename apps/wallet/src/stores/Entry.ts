import { defineStore } from 'pinia';
import { useWalletStore } from '.';
import { useAuthStore } from './Auth';

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
            const { entry, metadata, erc721, error } = await this.request('/qr-codes/' + uuid);
            if (error) throw new Error(error.message);

            this.entry = entry;
            this.erc721 = erc721;
            this.metadata = metadata;
        },
        async collect(uuid: string) {
            const { wallet } = useWalletStore();
            if (!wallet) throw new Error('Wallet not found');

            await this.request(`/qr-codes/${uuid}`, {
                isAuthenticated: true,
                method: 'PATCH',
                params: { walletId: wallet._id },
            });
            await this.get(uuid);
        },
    },
});

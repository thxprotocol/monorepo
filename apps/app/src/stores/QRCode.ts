import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/common/lib/mixpanel';

export const useQRCodeStore = defineStore('qrcode', {
    state: (): TQRCodeState => ({
        entry: null,
        metadata: null,
        erc721: null,
    }),
    actions: {
        async getEntry(uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.qrCodes.get(uuid);
            this.entry = r.entry;
            this.metadata = r.metadata;
            this.erc721 = r.erc721;

            sessionStorage.setItem('thxClaimUuid', uuid);

            track('UserVisits', [account?.sub, 'claim URL', { poolId, origin: config.origin }]);

            return r;
        },
        async collect(uuid: string, wallet: TWallet) {
            const { api, account, poolId, config } = useAccountStore();
            await api.request.patch(`/v1/qr-codes/${uuid}`, { params: { walletId: wallet._id } });
            sessionStorage.removeItem('thxClaimUuid');

            track('UserCreates', [account?.sub, 'claim URL claim', { poolId, origin: config.origin }]);
        },
    },
});

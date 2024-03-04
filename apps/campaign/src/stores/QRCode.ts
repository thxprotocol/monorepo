import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';

export const useQRCodeStore = defineStore('claims', {
    state: (): TQRCodeState => ({
        error: '',
        claim: null,
        metadata: null,
        erc721: null,
    }),
    actions: {
        async getClaim(uuid: string) {
            const { api, account, poolId, config } = useAccountStore();
            const r = await api.qrCodes.get(uuid);
            this.error = r.error;
            this.claim = r.claim;
            this.metadata = r.metadata;
            this.erc721 = r.erc721;

            if (!this.error || !this.claim?.error) {
                sessionStorage.setItem('thxClaimUuid', uuid);
            }

            track('UserVisits', [account?.sub, 'claim URL', { poolId, origin: config.origin }]);

            return r;
        },
        async collect(uuid: string, wallet: TWallet) {
            const { api, account, poolId, config } = useAccountStore();
            if (!this.claim) this.getClaim(uuid);

            await api.qrCodes.entry.create(uuid, { params: { walletId: wallet._id } });

            sessionStorage.removeItem('thxClaimUuid');

            track('UserCreates', [account?.sub, 'claim URL claim', { poolId, origin: config.origin }]);
        },
    },
});

import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
// import { track } from '@thxnetwork/mixpanel';

export const useClaimStore = defineStore('claims', {
    state: (): TClaimState => ({
        error: '',
        claim: null,
        metadata: null,
        erc721: null,
    }),
    actions: {
        async getClaim(uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            const r = await api.claims.get(uuid);
            this.error = r.error;
            this.claim = r.claim;
            this.metadata = r.metadata;
            this.erc721 = r.erc721;

            if (!this.error || !this.claim?.error) {
                sessionStorage.setItem('thxClaimUuid', uuid);
            }

            track('UserVisits', [account?.sub, 'claim URL', { poolId, origin: getConfig(poolId).origin }]);

            return r;
        },
        async collect(uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            if (!this.claim) this.getClaim(uuid);

            await api.claims.collect({ poolId, claimUuid: uuid });

            sessionStorage.removeItem('thxClaimUuid');

            track('UserCreates', [account?.sub, 'claim URL claim', { poolId, origin: getConfig(poolId).origin }]);
        },
    },
});

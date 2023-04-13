import { defineStore } from 'pinia';
import { useAccountStore } from './Account';
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
            const { api } = useAccountStore();
            const { error, claim, erc721, metadata } = await api.claims.get(uuid);
            this.error = error;
            this.claim = claim;
            this.metadata = metadata;
            this.erc721 = erc721;
        },
        async collect(uuid: string) {
            const { api } = useAccountStore();
            if (!this.claim) this.getClaim(uuid);
            await api.claims.collect({ poolId: this.claim?.poolId, claimUuid: uuid });
        },
    },
});

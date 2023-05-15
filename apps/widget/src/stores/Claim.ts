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
            const { api } = useAccountStore();
            const { error, claim, erc721, metadata } = await api.claims.get(uuid);
            this.error = error;
            this.claim = claim;
            this.metadata = metadata;
            this.erc721 = erc721;
        },
        async collect(uuid: string) {
            const { api, account, poolId, getConfig } = useAccountStore();
            if (!this.claim) this.getClaim(uuid);
            await api.claims.collect({ poolId, claimUuid: uuid });

            track('UserCreates', [account?.sub, 'nft perk claim', { poolId, origin: getConfig(poolId).origin }]);
        },
    },
});

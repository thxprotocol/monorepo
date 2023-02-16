import { defineStore } from 'pinia';
import { toNumber } from '../utils/rewards';
import { useAccountStore } from './Account';
import { track } from '@thxnetwork/mixpanel';
import { parseUnitAmount } from '../utils/price';

export const usePerkStore = defineStore('perks', {
    state: (): TPerkState => ({
        perks: [],
    }),
    actions: {
        createERC20Redemption: async (uuid: string) => {
            const { api, account } = useAccountStore();
            debugger;
            const { error } = await api.perksManager.erc20.redemption.post(uuid);
            if (error) throw error;

            track('UserCreates', [account?.sub, 'coin perk payment']);
        },
        createERC721Redemption: async (uuid: string) => {
            const { api, account } = useAccountStore();
            const { error } = await api.perksManager.erc721.redemption.post(uuid);
            if (error) throw error;

            track('UserCreates', [account?.sub, 'nft perk redemption']);
        },
        createERC721Payment: async (uuid: string) => {
            const { api, account } = useAccountStore();
            const r = await api.perksManager.erc721.payment.post(uuid);
            if (r.error) throw r.error;

            track('UserCreates', [account?.sub, 'nft perk payment']);

            return r;
        },
        async getERC20Perk(uuid: string) {
            const { api } = useAccountStore();
            await api.perksManager.erc20.get(uuid);
        },
        async getERC721Perk(uuid: string) {
            const { api } = useAccountStore();
            await api.perksManager.erc721.get(uuid);
        },
        async list() {
            const { api } = useAccountStore();
            const { erc20Perks, erc721Perks } = await api.perksManager.list();
            erc20Perks.sort((a: any, b: any) => toNumber(b.isPromoted) - toNumber(a.isPromoted));
            erc721Perks.sort((a: any, b: any) => toNumber(b.isPromoted) - toNumber(a.isPromoted));

            this.perks = [
                ...(erc20Perks
                    ? Object.values(erc20Perks).map((r: any) => {
                          r.component = 'BaseCardPerkERC20';
                          return r;
                      })
                    : []),
                ...(erc721Perks
                    ? Object.values(erc721Perks).map((r: any) => {
                          r.component = 'BaseCardPerkERC721';
                          r.price = parseUnitAmount(r.price);
                          return r;
                      })
                    : []),
            ];
        },
    },
});

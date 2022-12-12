import { defineStore } from 'pinia';
import { useAccountStore } from './Account';

export const usePerkStore = defineStore('perks', {
    state: (): TPerkState => ({
        perks: [],
    }),
    actions: {
        payment: {
            async post(uuid: string) {
                const { api } = useAccountStore();
                const result = await api.perksManager.erc721.payment.post(uuid);
                debugger;
            },
        },
        async get(id: string) {
            const { api } = useAccountStore();
            const result = await api.perksManager.erc721.get();
        },
        async list() {
            const { api } = useAccountStore();
            const { erc20Perks, erc721Perks } = await api.perksManager.list();
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
                          return r;
                      })
                    : []),
            ];
        },
    },
});

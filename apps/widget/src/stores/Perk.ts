import { defineStore } from 'pinia';
import { useAccountStore } from './Account';

export const usePerkStore = defineStore('perks', {
    state: (): TPerkState => ({
        perks: [],
    }),
    actions: {
        async createERC20PerkPayment(uuid: string) {
            const { api } = useAccountStore();
            const { error } = await api.perksManager.erc20.payment.post(uuid);
            if (error) throw error;
        },
        async createERC721PerkPayment(uuid: string) {
            const { api } = useAccountStore();
            const { error } = await api.perksManager.erc721.payment.post(uuid);
            if (error) throw error;
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

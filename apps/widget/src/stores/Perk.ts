import { defineStore } from 'pinia';
import { API_URL } from '../config/secrets';
import { useAccountStore } from './Account';

export const usePerkStore = defineStore('perks', {
    state: (): TPerkState => ({
        perks: [],
    }),
    actions: {
        async redeem(uuid: string) {
            //
        },
        async get(id: string) {
            //
        },
        async list() {
            // const r = await fetch(API_URL + '/v1/perks', {
            //     method: 'GET',
            //     headers: new Headers([['X-PoolId', useAccountStore().config().poolId]]),
            //     mode: 'cors',
            // });
            // const results = await r.json();
            // this.perks = [
            //     ...Object.values(results.erc721).map((r: any) => {
            //         r.component = 'BaseCardPerkERC721';
            //         return r;
            //     }),
            //     ...Object.values(results.erc20).map((r: any) => {
            //         r.component = 'BaseCardPerkERC20';
            //         return r;
            //     }),
            // ];
        },
    },
});

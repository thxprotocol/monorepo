import { thx } from '../utils/thx';
import { defineStore } from 'pinia';

export const useAccountStore = defineStore('account', {
    state: () => ({
        account: null,
        balance: 50,
    }),
    actions: {
        signin() {
            thx.signin();
        },
        signout() {
            thx.signout();
        },
    },
});

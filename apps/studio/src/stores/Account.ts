import { ChainId } from '@thxnetwork/common/enums';
import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';

export const useAccountStore = defineStore('account', {
    state: () => ({
        account: null as null | TAccount,
        profiles: [] as TWidget[],
        wallets: [] as TWallet[],
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async get() {
            this.account = await this.request('/account');
        },
        async getProfiles() {
            this.profiles = await this.request('/widgets');
        },
        async updateProfile(profileId: string, profile: Partial<TWidget>) {
            await this.request(`/widgets/${profileId}`, {
                method: 'PATCH',
                body: profile,
            });
        },
        async removeProfile(profileId: string) {
            await this.request(`/widgets/${profileId}`, {
                method: 'DELETE',
            });
            this.profiles = this.profiles.filter((profile) => profile._id !== profileId);
        },
        async createWallet({ chainId }: { chainId: ChainId }) {
            const wallet = await this.request('/wallets', {
                method: 'POST',
                body: { chainId },
            });
            this.wallets.push(wallet);
        },
        async listWallets() {
            this.wallets = await this.request('/wallets');
        },
        async removeWallet(walletId: string) {
            await this.request(`/wallets/${walletId}`, {
                method: 'DELETE',
            });
            this.wallets = this.wallets.filter((wallet) => wallet._id !== walletId);
        },
        async updateTransaction(transactionId: string, body: Partial<TTransaction>) {
            await this.request(`/transactions/${transactionId}`, {
                method: 'PATCH',
                body,
            });
            await this.listWallets();
        },
        async removeTransaction(transactionId: string) {
            await this.request(`/transactions/${transactionId}`, {
                method: 'DELETE',
            });
            await this.listWallets();
        },
    },
});

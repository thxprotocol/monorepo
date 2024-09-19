import { defineStore } from 'pinia';
import { useAuthStore } from './Auth';
import { getStyles } from '../utils/theme';
import { decodeHTML } from '../utils/decode-html';

export const useAccountStore = defineStore('account', {
    state: () => ({
        isModalAccountShown: false,
        account: null as null | TAccount,
        settings: null as null | TWidget,
        wallet: null as null | TWallet,
        wallets: [] as TWallet[],
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async get() {
            this.account = await this.request('/account');
        },
        async getWallets() {
            this.wallets = await this.request('/account/wallets');
        },
        async getSettings(widgetId: string) {
            const settings = await this.request(`/widget/${widgetId}`);
            const theme = JSON.parse(settings.theme);

            this.settings = settings;

            const styles = getStyles(theme.elements, theme.colors);
            document.title = decodeHTML(settings.title || 'no title') as string;
            document.head.appendChild(styles);
        },
    },
});
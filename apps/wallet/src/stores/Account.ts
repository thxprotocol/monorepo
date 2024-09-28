import { defineStore } from 'pinia';
import { URL } from 'url';
import { decodeHTML } from '../utils/decode-html';
import { getStyles } from '../utils/theme';
import { useAuthStore } from './Auth';

export const useAccountStore = defineStore('account', {
    state: () => ({
        isModalAccountShown: false,
        account: null as null | TAccount,
        settings: null as null | TWidget,
    }),
    actions: {
        request(path: string, options?: TRequestOptions) {
            return useAuthStore().request(path, options);
        },
        async get() {
            this.account = await this.request('/account', { isAuthenticated: true });
        },
        async getSettings(widgetId: string) {
            const settings = await this.request(`/widget/${widgetId}`);
            const theme = JSON.parse(settings.theme);

            this.settings = settings;

            const styles = getStyles(theme.elements, theme.colors);
            document.title = settings.name ? decodeHTML(settings.name) : document.title;
            document.head.appendChild(styles);
        },
        postMessage(payload: any) {
            if (this.settings?.domain && window.self !== window.top) {
                window.top?.postMessage(payload, new URL(this.settings.domain).toString());
            }
        },
    },
});

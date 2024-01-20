import { BootstrapVueNext, vBTooltip } from 'bootstrap-vue-next';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { MODE, API_URL, MIXPANEL_TOKEN, AUTH_URL, WIDGET_URL } from './config/secrets';
import VueClipboard from 'vue3-clipboard';
import Vue3Toastify from 'vue3-toastify';
import App from './App.vue';
import router from './router';
import Mixpanel from '@thxnetwork/mixpanel';
import { Sentry } from '@thxnetwork/common';

declare global {
    interface Window {
        ethereum: any;
    }
}

const pinia = createPinia();
const app = createApp(App);

if (MODE === 'production') {
    Sentry.init(app, router, [WIDGET_URL, API_URL, AUTH_URL]);
}

Mixpanel.init(MIXPANEL_TOKEN, API_URL);

app.directive('b-tooltip', vBTooltip);
app.use(pinia);
app.use(router);
app.use(BootstrapVueNext);
app.use(Vue3Toastify, {
    limit: 2,
});
app.use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true,
});
app.config.warnHandler = () => {
    //
};
app.mount('#app');

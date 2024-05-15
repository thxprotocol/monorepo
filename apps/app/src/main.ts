import { BootstrapVueNext, vBTooltip } from 'bootstrap-vue-next';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Sentry } from '@thxnetwork/common/lib/sentry';
import { GCLOUD_RECAPTCHA_SITE_KEY, MODE, API_URL, MIXPANEL_TOKEN, AUTH_URL, WIDGET_URL } from './config/secrets';
import App from './App.vue';
import VueClipboard from 'vue3-clipboard';
import Vue3Toastify from 'vue3-toastify';
import router from './router';
import Mixpanel from '@thxnetwork/common/lib/mixpanel';

import './scss/main.scss';

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
// Create the Mixpanel instance
Mixpanel.init(MIXPANEL_TOKEN, API_URL);

// Create the ReCaptcha script tag for the environments site key and append it to the head
const script = document.createElement('script');
script.src = `https://www.google.com/recaptcha/enterprise.js?render=${GCLOUD_RECAPTCHA_SITE_KEY}`;
document.head.appendChild(script);

// Directives and plugins
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

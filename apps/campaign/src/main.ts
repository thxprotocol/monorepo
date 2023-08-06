import { BootstrapVueNext } from 'bootstrap-vue-next';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { API_URL, MIXPANEL_TOKEN } from './config/secrets';
import VueClipboard from 'vue3-clipboard';
import Vue3Toastify from 'vue3-toastify';
import App from './App.vue';
import router from './router';
import Mixpanel from '@thxnetwork/mixpanel';

declare global {
    interface Window {
        ethereum: any;
    }
}

Mixpanel.init(MIXPANEL_TOKEN, API_URL);

const pinia = createPinia();
const app = createApp(App);

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
app.mount('#app');

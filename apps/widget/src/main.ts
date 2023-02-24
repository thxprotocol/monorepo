import { BootstrapVue3 } from 'bootstrap-vue-3';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import VueClipboard from 'vue3-clipboard';
import App from './App.vue';
import router from './router';

import { API_URL, MIXPANEL_TOKEN } from './config/secrets';
import Mixpanel from '@thxnetwork/mixpanel';

Mixpanel.init(MIXPANEL_TOKEN, API_URL);

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(BootstrapVue3);
app.use(VueClipboard, {
    autoSetContainer: true,
    appendToBody: true,
});

app.mount('#app');

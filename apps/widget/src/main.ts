import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';

import BootstrapVue3 from 'bootstrap-vue-3';
import VueClipboard from 'vue3-clipboard';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

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

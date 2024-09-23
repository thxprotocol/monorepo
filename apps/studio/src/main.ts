import { BootstrapVueNext, vBTooltip } from 'bootstrap-vue-next';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import Vue3Toastify from 'vue3-toastify';
import VueClipboard from 'vue3-clipboard';
import router from './router';
import './scss/main.scss';

const pinia = createPinia();
const app = createApp(App);

app.directive('b-tooltip', vBTooltip);
app.use(pinia);
app.use(router);
app.use(BootstrapVueNext);
app.use(Vue3Toastify, { limit: 5 });
app.use(VueClipboard, { autoSetContainer: true, appendToBody: true });
app.config.warnHandler = () => {
    //
};
app.mount('#app');

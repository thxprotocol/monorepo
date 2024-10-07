import { BootstrapVueNext, vBTooltip } from 'bootstrap-vue-next';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import VueClipboard from 'vue3-clipboard';
import Vue3Toastify from 'vue3-toastify';
import App from './App.vue';
import router from './router';
import './scss/main.scss';
import { useAuthStore } from './stores';

const pinia = createPinia();
const app = createApp(App);

// Directives and plugins
app.directive('b-tooltip', vBTooltip);
app.use(pinia);
app.use(router);
app.use(BootstrapVueNext);
app.use(Vue3Toastify, { limit: 5 });
app.use(VueClipboard, { autoSetContainer: true, appendToBody: true });
app.config.warnHandler = () => {
    //
};
window.onmessage = useAuthStore().onMessage;
app.mount('#app');

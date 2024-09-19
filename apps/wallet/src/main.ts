import { BootstrapVueNext, vBTooltip } from 'bootstrap-vue-next';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import Vue3Toastify from 'vue3-toastify';
import router from './router';
import './scss/main.scss';

const pinia = createPinia();
const app = createApp(App);

// Directives and plugins
app.directive('b-tooltip', vBTooltip);
app.use(pinia);
app.use(router);
app.use(BootstrapVueNext);
app.use(Vue3Toastify, { limit: 5 });
app.config.warnHandler = () => {
    //
};
app.mount('#app');
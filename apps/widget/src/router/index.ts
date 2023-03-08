import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAccountStore } from '../stores/Account';
import { track } from '@thxnetwork/mixpanel';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        path: '/perks',
        name: 'perks',
        component: () => import(/* webpackChunkName: "perks" */ '../views/Perks.vue'),
    },
    {
        path: '/wallet',
        name: 'wallet',
        component: () => import(/* webpackChunkName: "wallet" */ '../views/Wallet.vue'),
    },
    {
        path: '/checkout/:uuid',
        name: 'checkout',
        component: () => import(/* webpackChunkName: "wallet" */ '../views/Checkout.vue'),
    },
    {
        path: '/checkout/:uuid/complete',
        name: 'checkout_complete',
        component: () => import(/* webpackChunkName: "wallet" */ '../views/CheckoutComplete.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;

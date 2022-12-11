import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        path: '/perks',
        name: 'Perks',
        component: () => import(/* webpackChunkName: "perks" */ '../views/Perks.vue'),
    },
    {
        path: '/wallet',
        name: 'Wallet',
        component: () => import(/* webpackChunkName: "wallet" */ '../views/Wallet.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;

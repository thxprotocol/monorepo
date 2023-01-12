import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAccountStore } from '../stores/Account';
import { track } from '../utils/mixpanel';

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
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

router.beforeEach((to) => {
    const { account } = useAccountStore();
    if (account) track.UserVisits(account.sub, to.name ? String(to.name) : 'unknown', to.params as unknown as string[]);
});

export default router;

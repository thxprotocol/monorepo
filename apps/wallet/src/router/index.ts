import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAccountStore } from '../stores';

async function beforeEnter(to: any, from: any, next: any) {
    const { settings, getSettings } = useAccountStore();
    if (!settings) {
        if (to.params.id) {
            try {
                await getSettings(to.params.id);
            } catch (error) {
                console.error('Could not get settings');
            }
        }
    }

    if (to.hash && to.hash.startsWith('#access_token')) {
        const path = to.path.split('#')[0];
        return next({ path });
    }

    next();
}

const routes: Array<RouteRecordRaw> = [
    {
        name: 'home',
        path: '/',
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        path: '/:id',
        name: 'wallet',
        beforeEnter,
        component: () => import(/* webpackChunkName: "wallet" */ '../views/Wallet.vue'),
        redirect: { name: 'overview' },
        children: [
            {
                name: 'overview',
                path: '/:id',
                component: () => import(/* webpackChunkName: "overview" */ '../views/wallet/Overview.vue'),
            },
            {
                name: 'collect',
                path: '/:id/collect/:uuid',
                alias: ['/:id/c/:uuid'],
                component: () => import(/* webpackChunkName: "collect" */ '../views/wallet/Collect.vue'),
            },
            {
                path: '/:id/logout',
                name: 'logout',
                component: () => import(/* webpackChunkName: "logout" */ '../views/wallet/Logout.vue'),
            },
        ],
    },
    {
        path: '/auth/redirect',
        name: 'auth-redirect',
        beforeEnter,
        component: () => import(/* webpackChunkName: "authredirect" */ '../views/LoginRedirect.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;

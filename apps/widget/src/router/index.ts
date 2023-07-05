import { useAccountStore } from '../stores/Account';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

function beforeEnter(to: any, from: any, next: any) {
    const { poolId, init } = useAccountStore();
    if (poolId) {
        next();
    } else {
        init({ poolId: to.params.poolId } as any).then(() => next());
    }
}

const routes: Array<RouteRecordRaw> = [
    {
        path: '/:poolId',
        name: 'home',
        redirect: (route) => {
            return `/${route.params.poolId}/quests`;
        },
    },
    {
        path: '/:poolId/redirect',
        component: () => import(/* webpackChunkName: "home" */ '../views/SigninRedirect.vue'),
    },
    {
        path: '/:poolId/quests',
        name: 'quests',
        beforeEnter,
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        path: '/:poolId/rewards',
        name: 'rewards',
        beforeEnter,
        component: () => import(/* webpackChunkName: "perks" */ '../views/Perks.vue'),
    },
    {
        path: '/:poolId/wallet',
        name: 'wallet',
        beforeEnter,
        component: () => import(/* webpackChunkName: "wallet" */ '../views/Wallet.vue'),
    },
    {
        path: '/:poolId/c/:uuid',
        name: 'collect',
        beforeEnter,
        component: () => import(/* webpackChunkName: "collect" */ '../views/Collect.vue'),
    },
    {
        path: '/:poolId/w/:uuid',
        name: 'CollectWallet',
        beforeEnter,
        component: () => import(/* webpackChunkName: "collectwallet" */ '../views/CollectWallet.vue'),
    },
    {
        path: '/:poolId/checkout/:uuid',
        name: 'checkout',
        beforeEnter,
        component: () => import(/* webpackChunkName: "checkout" */ '../views/Checkout.vue'),
    },
    {
        path: '/:poolId/checkout/:uuid/complete',
        name: 'checkout_complete',
        beforeEnter,
        component: () => import(/* webpackChunkName: "checkoutcomplete" */ '../views/CheckoutComplete.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;

import { useAccountStore } from '../stores/Account';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

function beforeEnter(to: any, from: any, next: any) {
    const { poolId, init, getConfig } = useAccountStore();
    if (poolId) {
        next();
    } else {
        // If there is no poolId we need to init and grab data either from query or storage
        const { id, origin, chainId, theme, expired, logoUrl, title, backgroundUrl } = to.query;
        if (id && origin && chainId && theme && expired && logoUrl) {
            init({
                poolId: id,
                origin,
                chainId,
                theme,
                logoUrl,
                backgroundUrl,
                title,
                expired: JSON.parse(expired as string),
            });
        } else {
            const { poolId, origin, chainId, theme, expired, logoUrl, backgroundUrl, title } = getConfig(
                to.params.poolId,
            );
            init({ poolId, origin, chainId, theme, logoUrl, backgroundUrl, expired, title });
        }

        next();
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

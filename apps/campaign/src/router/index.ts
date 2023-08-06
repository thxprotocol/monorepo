import { useAccountStore } from '../stores/Account';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

function beforeEnter(to: any, from: any, next: any) {
    const { poolId, init } = useAccountStore();
    if (poolId) {
        next();
    } else {
        init(to.params.poolId, to.query.origin).then(() => next());
    }
}

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        path: '/c/:poolId',
        name: 'campaign',
        component: () => import(/* webpackChunkName: "campaign" */ '../views/Campaign.vue'),
        redirect: (route) => {
            return `/c/${route.params.poolId}/quests`;
        },
        children: [
            {
                path: '/c/:poolId/redirect',
                component: () =>
                    import(/* webpackChunkName: "signinredirect" */ '../views/campaign/SigninRedirect.vue'),
            },
            {
                path: '/c/:poolId/quests',
                name: 'quests',
                beforeEnter,
                component: () => import(/* webpackChunkName: "campaignhome" */ '../views/campaign/Home.vue'),
            },
            {
                path: '/c/:poolId/rewards',
                name: 'rewards',
                beforeEnter,
                component: () => import(/* webpackChunkName: "perks" */ '../views/campaign/Perks.vue'),
            },
            {
                path: '/c/:poolId/wallet',
                name: 'wallet',
                beforeEnter,
                component: () => import(/* webpackChunkName: "wallet" */ '../views/campaign/Wallet.vue'),
            },
            {
                path: '/c/:poolId/c/:uuid',
                name: 'collect',
                beforeEnter,
                component: () => import(/* webpackChunkName: "collect" */ '../views/campaign/Collect.vue'),
            },
            {
                path: '/c/:poolId/w/:uuid',
                name: 'CollectWallet',
                beforeEnter,
                component: () => import(/* webpackChunkName: "collectwallet" */ '../views/campaign/CollectWallet.vue'),
            },
            {
                path: '/c/:poolId/checkout/:uuid',
                name: 'checkout',
                beforeEnter,
                component: () => import(/* webpackChunkName: "checkout" */ '../views/campaign/Checkout.vue'),
            },
            {
                path: '/c/:poolId/checkout/:uuid/complete',
                name: 'checkout_complete',
                beforeEnter,
                component: () =>
                    import(/* webpackChunkName: "checkoutcomplete" */ '../views/campaign/CheckoutComplete.vue'),
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
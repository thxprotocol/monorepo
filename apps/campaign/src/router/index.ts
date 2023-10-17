import { useAccountStore } from '../stores/Account';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

function beforeEnter(to: any, from: any, next: any) {
    const { poolId, init } = useAccountStore();
    if (poolId) {
        next();
    } else {
        const isPreview = to.query.isPreview ? JSON.parse(to.query.isPreview) : false;
        init(to.params.poolId, to.query.origin, isPreview).then(() => next());
    }
}

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: '',
        beforeEnter,
        component: () => import(/* webpackChunkName: "public" */ '../views/Public.vue'),
        children: [
            {
                path: '/',
                name: 'home',
                component: () => import(/* webpackChunkName: "home" */ '../views/public/Home.vue'),
            },
            {
                path: '/earn',
                name: 'earn',
                component: () => import(/* webpackChunkName: "home" */ '../views/public/Earn.vue'),
            },
        ],
    },
    {
        path: '/maintenance',
        name: 'maintenance',
        component: () => import(/* webpackChunkName: "maintenance" */ '../views/Maintenance.vue'),
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
                path: '/c/:poolId/signin',
                name: 'signin',
                beforeEnter,
                component: () => import(/* webpackChunkName: "signin" */ '../views/campaign/Signin.vue'),
            },
            {
                path: '/c/:poolId/quests',
                name: 'quests',
                beforeEnter,
                component: () => import(/* webpackChunkName: "quests" */ '../views/campaign/Quests.vue'),
            },
            {
                path: '/c/:poolId/rewards',
                name: 'rewards',
                beforeEnter,
                component: () => import(/* webpackChunkName: "rewards" */ '../views/campaign/Rewards.vue'),
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
                name: 'ConnectWallet',
                beforeEnter,
                component: () => import(/* webpackChunkName: "connectwallet" */ '../views/campaign/ConnectWallet.vue'),
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

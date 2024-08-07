import { useAccountStore } from '../stores/Account';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

async function beforeEnter(to: any, from: any, next: any) {
    // Redirect to last match
    if (to.hash && to.hash.startsWith('#access_token')) {
        const path = to.path.split('#')[0];
        return next({ path });
    }

    // Init campaign if poolId is available
    const { poolId, init } = useAccountStore();
    if (!poolId) {
        await init(to.params.slug, to.query.origin);
    }
    next();
}

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: '',
        beforeEnter: (to, from, next) => {
            beforeEnter(to, from, next);
            useAccountStore().reset();
        },
        component: () => import(/* webpackChunkName: "discovery" */ '../views/Discovery.vue'),
        children: [
            {
                path: '/',
                name: 'home',
                component: () => import(/* webpackChunkName: "home" */ '../views/discovery/Home.vue'),
            },
            {
                path: '/i/:code',
                name: 'inviteRedirect',
                beforeEnter: async (to, from, next) => {
                    const { code } = to.params;
                    if (!code) return next();

                    const accountStore = useAccountStore();
                    await accountStore.getInvite(code as string);

                    next({ name: 'questsInvite', params: { slug: accountStore.invite?.campaign.slug, code } });
                },
                component: () => import(/* webpackChunkName: "invite" */ '../views/campaign/Quests.vue'),
            },
            {
                path: '/learn',
                name: 'learn',
                component: () => import(/* webpackChunkName: "learn" */ '../views/discovery/Learn.vue'),
            },

            {
                path: '/earn',
                redirect: '/members',
                // name: 'earn',
                // component: () => import(/* webpackChunkName: "earn" */ '../views/discovery/Earn.vue'),
            },
            {
                path: '/governance',
                name: 'governance',
                component: () => import(/* webpackChunkName: "earn" */ '../views/discovery/Governance.vue'),
            },
            {
                path: '/members',
                name: 'members',
                component: () => import(/* webpackChunkName: "earn" */ '../views/discovery/Members.vue'),
            },
            {
                path: '/wallets',
                name: 'wallets',
                beforeEnter,
                component: () => import(/* webpackChunkName: "wallets" */ '../views/Wallets.vue'),
            },
        ],
    },
    {
        path: '/auth/redirect',
        name: 'auth-redirect',
        component: () => import(/* webpackChunkName: "home" */ '../views/SigninRedirect.vue'),
    },
    // {
    //     path: '/verify_email',
    //     name: '',
    //     beforeEnter: async (to) => {
    //         const { verifyEmailToken, return_url } = to.query;
    //         await useAccountStore().verifyEmail(verifyEmailToken as string, return_url as string);
    //     },
    //     component: () => import(/* webpackChunkName: "home" */ '../views/discovery/Home.vue'),
    // },
    {
        path: '/c/:slug',
        name: 'campaign',
        component: () => import(/* webpackChunkName: "campaign" */ '../views/Campaign.vue'),
        redirect: (route) => {
            return `/c/${route.params.slug}/quests`;
        },
        children: [
            {
                path: '/c/:slug/about',
                name: 'about',
                beforeEnter,
                component: () => import(/* webpackChunkName: "about" */ '../views/campaign/About.vue'),
            },
            {
                path: '/c/:slug/signin',
                name: 'signin',
                beforeEnter,
                component: () => import(/* webpackChunkName: "signin" */ '../views/campaign/Signin.vue'),
            },
            {
                path: '/c/:slug/quests',
                name: 'quests',
                beforeEnter,
                component: () => import(/* webpackChunkName: "quests" */ '../views/campaign/Quests.vue'),
            },
            {
                path: '/c/:slug/quests/i/:code',
                name: 'questsInvite',
                beforeEnter,
                component: () => import(/* webpackChunkName: "questsInvite" */ '../views/campaign/Quests.vue'),
            },
            {
                path: '/c/:slug/ranking',
                name: 'ranking',
                beforeEnter,
                component: () => import(/* webpackChunkName: "ranking" */ '../views/campaign/Ranking.vue'),
            },
            {
                path: '/c/:slug/rewards',
                name: 'rewards',
                beforeEnter,
                component: () => import(/* webpackChunkName: "rewards" */ '../views/campaign/Rewards.vue'),
            },
            {
                path: '/c/:slug/wallets',
                name: 'campaignwallets',
                beforeEnter,
                component: () => import(/* webpackChunkName: "campaignwallets" */ '../views/Wallets.vue'),
            },
            {
                path: '/c/:slug/c/:uuid',
                name: 'collect',
                beforeEnter,
                component: () => import(/* webpackChunkName: "collect" */ '../views/campaign/Collect.vue'),
            },
            {
                path: '/c/:slug/w',
                name: 'Identities',
                beforeEnter,
                component: () => import(/* webpackChunkName: "identities" */ '../views/campaign/Identities.vue'),
            },
            {
                path: '/c/:slug/w/:uuid',
                name: 'IdentitiesWithUuid',
                beforeEnter,
                component: () => import(/* webpackChunkName: "identities" */ '../views/campaign/Identities.vue'),
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;

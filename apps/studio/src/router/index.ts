import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/Auth';

async function beforeEnter(to: any, from: any, next: any) {
    // Redirect to last match
    if (to.hash && to.hash.startsWith('#access_token')) {
        const path = to.path.split('#')[0];
        return next({ path });
    }
    next();
}

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: '',
        meta: { requiresAuth: true },
        beforeEnter,
        component: () => import(/* webpackChunkName: "studio" */ '../views/Studio.vue'),
        children: [
            {
                name: 'collections',
                path: '/',
                alias: ['/collections'],
                component: () => import(/* webpackChunkName: "collections" */ '../views/studio/Collections.vue'),
            },
            {
                name: 'collectioncreate',
                path: '/collections/create',
                component: () =>
                    import(/* webpackChunkName: "collectioncreate" */ '../views/studio/CollectionCreate.vue'),
            },
            {
                name: 'collection',
                path: '/collections/:id',
                component: () => import(/* webpackChunkName: "collection" */ '../views/studio/CollectionCreate.vue'),
            },
            {
                name: 'qr',
                path: '/qr-codes',
                component: () => import(/* webpackChunkName: "entries" */ '../views/studio/Entries.vue'),
            },
        ],
    },
    {
        path: '/account',
        name: 'account',
        component: () => import(/* webpackChunkName: "signinredirect" */ '../views/LoginRedirect.vue'),
    },
    {
        path: '/auth/redirect',
        name: 'auth-redirect',
        component: () => import(/* webpackChunkName: "signinredirect" */ '../views/LoginRedirect.vue'),
    },
    {
        path: '/login',
        name: 'login',
        component: () => import(/* webpackChunkName: "login" */ '../views/Login.vue'),
    },
    {
        path: '/logout',
        name: 'logout',
        component: () => import(/* webpackChunkName: "logout" */ '../views/Logout.vue'),
        beforeEnter: async (to, from, next) => {
            await useAuthStore().logout();
            next({ name: 'login' });
        },
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach(async (to, from, next) => {
    // This route requires auth, check if logged in
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        // Not logged in, redirect to login page
        const session = await useAuthStore().getSession();
        if (!session) {
            next({ name: 'login', query: { redirect: to.fullPath } });
        }
        // Logged in, proceed to route
        else {
            next();
        }
    } else {
        // Route does not require auth, proceed
        next();
    }
});
export default router;
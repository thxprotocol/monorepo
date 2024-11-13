<template>
    <b-alert v-show="isOffline" v-model="isOffline" class="m-3" variant="primary">
        <i class="fas fa-tools me-2" />
        We are running some maintenance and will be back shortly. See you soon! ❤️
    </b-alert>
    <!-- <div v-else id="main" :class="{ 'overflow-hidden': accountStore.isMobile }"> -->
    <div v-show="!isOffline" id="main">
        <BaseNavbarTop />
        <div class="h-100">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" class="router-view-app order-lg-0" />
                </transition>
            </router-view>
            <!-- <BaseSidebar /> -->
        </div>
        <BaseModalLogin />
        <BaseModalAccount size="lg" />
        <BaseModalWalletConnect />
        <BaseModalWalletCreate size="lg" />
        <BaseModalChainSelect size="sm" />
        <BaseModalWalletRecovery size="lg" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { GTM, MAINTENANCE } from './config/secrets';
import { initGTM } from './utils/ga';
import { mapStores } from 'pinia';
import { useAuthStore } from './stores/Auth';
import { useAccountStore } from './stores/Account';
import { useWalletStore } from './stores/Wallet';

export default defineComponent({
    data() {
        return {
            test: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
        isOffline(): boolean {
            try {
                return this.$route.query.maintenance
                    ? !!JSON.parse(this.$route.query.maintenance)
                    : !!JSON.parse(MAINTENANCE);
            } catch (error) {
                return false;
            }
        },
        scrollHeight() {
            const { windowHeight, isMobile } = this.accountStore;
            // Return null to disable custom scroller
            if (isMobile) return null;
            const mobileOffset = 30;
            const height = windowHeight - mobileOffset;
            return { height: `${height}px` };
        },
    },
    watch: {
        'accountStore.isSidebarShown'() {
            document.body.classList[this.accountStore.isMobile ? 'add' : 'remove']('overflow-hidden');
        },
        'accountStore.account'(account: TAccount) {
            if (!account) return;

            // If an e-mail is set, but not verified then show the account modal
            // if (account.email && !account.isEmailVerified) {
            //     this.accountStore.isModalAccountShown = true;
            // }
        },
    },
    async created() {
        if (GTM) initGTM();
        // await this.authStore.restoreUser();
    },
    async mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        let clid = urlParams.get('clid');

        if (!clid) {
            clid = this.getCookieReduce('clid');
        }

        const user = this.accountStore.isAuthenticated;
        if (clid && !user) {
            await this.authenticateUser(clid);
        }
    },
    methods: {
        getCookieReduce(name: string): string {
            return document.cookie.split('; ').reduce((r, v) => {
                const [n, ...val] = v.split('='); // cookie value can contain "="
                if (r) return r; // returns first found cookie
                return n === name ? decodeURIComponent(val.join('=')) : r; // returns last found cookie (overwrites)
            }, '');
        },
        async authenticateUser(clid: string) {
            try {
                await this.accountStore.signinWithClid(clid);
            } catch (error) {
                console.error('Authentication error:', error);
            }
        },
        async refreshUser() {
            // await this.authStore.requestOAuthShareRefresh();
            //     try {
            //         await this.authStore.waitForUser();
            //     } catch (error) {
            //         console.error('Authentication error:', error);
            //     }
        },
    },
});
</script>

<style lang="scss">
#app {
    background-color: #000;
}
.router-view-app {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    // overflow-x: hidden;
    // overflow-y: auto;
    height: 100% !important;
}
.unwrap {
    padding: 50px 0 0;
    line-height: 35vh;
    font-size: 21vw;
    color: #3b3306;
    font-weight: 800;
    border-radius: 15px;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke-color: rgba(255, 205, 7, 0.9);
    -webkit-text-stroke-width: 6px;
    background-position: top;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    transition: 1s all ease-in-out;
    -moz-transition: 1s all ease-in-out;
    -webkit-transition: 1s all ease-in-out;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
}

.bg-santa {
    background: url(/src/assets/top-bg.jpg);
    border-bottom-left-radius: 30px;
    border-bottom-right-radius: 30px;
    //border: 1px dotted rgb(23 72 208);
    overflow: hidden;
    box-shadow: inset 1px 20px 20px 15px rgb(8 1 1 / 94%);
    /* border-top-right-radius: 0; */
    /* border-top-left-radius: 0; */
    /* border-top: 0; */
    background-position: center 20%;
    background-repeat: no-repeat;
    background-size: cover;
}

.bg-blur {
    backdrop-filter: blur(5px);
}
</style>

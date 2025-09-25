<template>
    <b-alert v-show="isOffline" v-model="isOffline" class="m-3" variant="primary">
        <i class="fas fa-tools me-2"></i>
        We are running some maintenance and will be back shortly. See you soon! ❤️
    </b-alert>
    <!-- <div v-else id="main" :class="{ 'overflow-hidden': accountStore.isMobile }"> -->
    <div v-show="!isOffline" id="main">
        <BaseNavbarTop />
        <div>
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" class="router-view-app order-lg-0 overflow-hidden" />
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
import { GTM, MAINTENANCE, SNOWPLOW_URL } from './config/secrets';
import { initGTM } from './utils/ga';
import { mapStores } from 'pinia';
import { useAuthStore } from './stores/Auth';
import { useAccountStore } from './stores/Account';
import { useWalletStore } from './stores/Wallet';
import { getAboutContent } from './config/aboutContent';
import { useThemeStore } from './stores/Stores';
import { initializeTracker } from './utils/snowplowTracker';

export default defineComponent({
    data() {
        return {
            test: false,
            currentTheme: 'dark',
            colorSchemeMediaQuery: null as MediaQueryList | null,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore, useThemeStore),
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
        preferredTheme(): string {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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

        // Check for the theme parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const themeParam = urlParams.get('theme');

        // Determine the initial theme
        const initialTheme = themeParam || this.preferredTheme;
        this.themeStore.setTheme(initialTheme);
        // Apply the initial theme
        document.documentElement.setAttribute('data-theme', initialTheme);
        this.currentTheme = initialTheme;
    },
    async mounted() {
        this.setBodyHeight();
        window.addEventListener('resize', this.setBodyHeight);
        const urlParams = new URLSearchParams(window.location.search);
        let clid: string | null = null;

        if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development') {
            clid = urlParams.get('clid');
        } else {
            const clidFromCookies = this.getCookieReduce('clid');
            clid = clidFromCookies;
            if (!clidFromCookies) {
                clid = await this.getClidFromExtension();
                if (!clid) {
                    alert('User information incorrect. Please reinstall the browser.');
                    return;
                }
            }
        }

        const user = this.accountStore.isAuthenticated;
        if (clid && !user) {
            await this.authenticateUser(clid);
        }

        if (!urlParams.get('theme')) {
            this.colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            // this.colorSchemeMediaQuery.addEventListener('change', this.handleColorSchemeChange);
        }

        cookieStore.addEventListener('change', this.handleCookieChange);

        if (clid) {
            initializeTracker(SNOWPLOW_URL, clid);
        }
    },
    beforeUnmount() {
        if (this.colorSchemeMediaQuery) {
            this.colorSchemeMediaQuery.removeEventListener('change', this.handleColorSchemeChange);
        }

        cookieStore.removeEventListener('change', this.handleCookieChange);
        window.removeEventListener('resize', this.setBodyHeight);
    },
    methods: {
        setBodyHeight() {
            document.body.style.setProperty('min-height', window.innerHeight + 'px', 'important');
            document.body.style.setProperty('height', window.innerHeight + 'px', 'important');
        },
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
        applyTheme(theme: string) {
            this.themeStore.setTheme(theme);
            this.currentTheme = theme;
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        },
        handleCookieChange({ changed }: any) {
            for (const { name, value } of changed) {
                if (name === 'theme' && value) {
                    this.applyTheme(value);
                }
            }
        },
        handleColorSchemeChange(event: MediaQueryListEvent) {
            const urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.get('theme')) {
                const newPreferredTheme = event.matches ? 'dark' : 'light';
                this.applyTheme(newPreferredTheme);
            }
        },
        getClidFromExtension(): Promise<string | null> {
            return new Promise((resolve) => {
                if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                    const NTP_EXTENSION_ID = 'ehlpnjcddkggjcbeonecfdfdbeiiopoh';
                    chrome.runtime.sendMessage(NTP_EXTENSION_ID, { message: 'getClid' }, (response) => {
                        if (chrome.runtime.lastError || !response || !response.clid) {
                            resolve(null);
                        } else {
                            resolve(response.clid);
                        }
                    });
                } else {
                    resolve(null);
                }
            });
        },
    },
});
</script>

<style lang="scss">
.router-view-app {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    // overflow-x: hidden;
    // overflow-y: auto;
    height: 100% !important;
}
</style>

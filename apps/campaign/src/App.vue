<template>
    <b-alert v-if="isOffline" v-model="isOffline" class="m-3" variant="primary">
        <i class="fas fa-tools me-2" />
        We are running some maintenance and will be back shortly. See you soon! ❤️
    </b-alert>
    <div v-else id="main" :class="{ 'overflow-hidden': accountStore.isMobile }">
        <BaseNavbarTop />
        <div class="d-flex justify-content-end h-100">
            <router-view class="router-view-app order-lg-0" />
            <BaseSidebar />
        </div>
        <BaseModalLogin />
        <BaseModalChainSwitch />
        <BaseModalAccount size="lg" />
        <BaseModalWalletCreate size="lg" />
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
        isOffline() {
            try {
                return JSON.parse(MAINTENANCE);
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
            if (account.email && !account.isEmailVerified) {
                this.accountStore.isModalAccountShown = true;
            }
        },
    },
    async created() {
        if (GTM) initGTM();
    },
});
</script>

<style lang="scss">
.router-view-app {
    flex-grow: 1;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;

    @media (min-width: 991px) {
        // 100% minus navbar top
        height: calc(100% - 30px) !important;
    }
}
</style>

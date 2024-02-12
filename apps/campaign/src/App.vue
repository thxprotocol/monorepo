<template>
    <div id="main" :class="{ 'overflow-hidden': accountStore.isMobile }">
        <BaseNavbarTop />
        <div class="d-flex justify-content-end h-100">
            <router-view class="router-view-app order-lg-0" />
            <BaseSidebar />
        </div>
        <BaseModalAccount size="lg" />
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { GTM } from './config/secrets';
import { initGTM } from './utils/ga';
import { mapStores } from 'pinia';
import { useAuthStore } from './stores/Auth';
import { useAccountStore } from './stores/Account';
import { useWalletStore } from './stores/Wallet';

import './scss/main.scss';

export default defineComponent({
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useWalletStore),
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
}
</style>

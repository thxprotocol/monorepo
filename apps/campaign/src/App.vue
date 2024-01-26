<template>
    <div id="main" :class="{ 'overflow-hidden': accountStore.isSidebarShown && accountStore.isMobile }">
        <BaseNavbarTop />
        <div class="d-flex justify-content-end h-100">
            <router-view class="flex-grow-1" />
            <BaseSidebar />
        </div>
        <BaseModalAccount size="lg" />
        <BaseModalWallet size="lg" />
        <BaseModalWalletCreate />
        <BaseModalWalletRecovery />
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
    },
    watch: {
        'accountStore.isSidebarShown'() {
            document.body.classList[this.accountStore.isMobile ? 'add' : 'remove']('overflow-hidden');
        },
        // OAuthshare retrieved but device share and security quesiton not found
        'authStore.isSecurityQuestionAvailable'(isSecurityQuestionAvailable) {
            const { oAuthShare, isDeviceShareAvailable } = this.authStore;
            if (!oAuthShare) return;

            this.walletStore.isModalWalletCreateShown =
                (isDeviceShareAvailable && !(isSecurityQuestionAvailable ?? false)) ||
                (!isDeviceShareAvailable && !(isSecurityQuestionAvailable ?? false));
            this.walletStore.isModalWalletRecoveryShown =
                !isDeviceShareAvailable && (isSecurityQuestionAvailable ?? false);

            // Achieved 3/3, let's patch account address and deploy Safe!
            if (isDeviceShareAvailable && isSecurityQuestionAvailable) {
                this.accountStore
                    .updateAccountAddress()
                    .then(() => this.walletStore.getWallet())
                    .catch(console.error);
            }
        },
    },
    async created() {
        if (GTM) initGTM();
    },
});
</script>

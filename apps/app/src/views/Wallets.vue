<template>
    <b-container>
        <b-alert v-if="isAlertShown" v-model="isAlertShown" variant="primary" class="py-2 mt-3">
            <i class="fas fa-gift me-2" />
            Sign in to see your rewards!
        </b-alert>
        <b-row v-else>
            <b-col lg="6" offset-lg="3" class="px-0">
                <BaseCardAccount v-if="accountStore.isMobile" />
                <BaseCardRewards />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'BaseViewWallets',
    computed: {
        ...mapStores(useWalletStore, useAccountStore),
        isAlertShown() {
            return !this.accountStore.isAuthenticated;
        },
    },
});
</script>

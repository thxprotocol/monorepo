<template>
    <div :style="{ minHeight: '100%' }" class="gradient-bg-opacity">
        <BaseNavbarTicker />
        <BaseNavbar />
        <router-view />
        <div class="bg-dark mt-auto">
            <BaseFooter />
        </div>
    </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';
import { useWalletStore } from '@thxnetwork/campaign/stores/Wallet';
import { useVeStore } from '@thxnetwork/campaign/stores/VE';

export default defineComponent({
    name: 'Discovery',
    computed: {
        ...mapStores(useLiquidityStore, useWalletStore, useVeStore),
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                this.liquidityStore.listMetrics(wallet);
                if (!wallet) return;
                this.veStore.getLocks(wallet);
            },
            immediate: true,
        },
    },
});
</script>

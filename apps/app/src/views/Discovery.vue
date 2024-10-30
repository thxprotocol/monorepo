<template>
    <div
        :style="{
            minHeight: '100%',
            background: 'linear-gradient(178deg, #151415 -37.16%, #0E0D10 98.54%)',
        }"
    >
        <!-- <BaseNavbarTicker /> -->
        <!-- <BaseNavbar /> -->
        <router-view />
        <!-- <div class="bg-dark mt-auto"> -->
        <!--            <BaseFooter />-->
        <!-- </div> -->
    </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { useWalletStore } from '@thxnetwork/app/stores/Wallet';
import { useVeStore } from '@thxnetwork/app/stores/VE';

export default defineComponent({
    name: 'Discovery',
    computed: {
        ...mapStores(useLiquidityStore, useWalletStore, useVeStore),
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                // this.liquidityStore.listMetrics(wallet);
                if (!wallet) return;
                // this.veStore.getLocks(wallet);
            },
            immediate: true,
        },
    },
});
</script>

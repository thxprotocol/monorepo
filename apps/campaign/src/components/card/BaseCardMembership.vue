<template>
    <div class="text-center">
        <div class="position-relative rounded-circle m-auto gradient-border-xl" style="width: 75px; height: 75px">
            <div
                class="position-relative bg-dark rounded-circle d-flex align-items-center justify-content-center"
                style="z-index: 1; width: 65px; height: 65px"
            >
                <i class="fas fa-id-card" style="font-size: 1.5rem" />
            </div>
        </div>
        <b-badge class="mt-2 p-2" variant="primary">
            <i class="fas fa-trophy me-1 text-opaque" />
            {{ membership }}
        </b-badge>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { fromWei } from 'web3-utils';

export default defineComponent({
    name: 'BaseCardMembership',
    data() {
        return {};
    },
    computed: {
        ...mapStores(useVeStore, useLiquidityStore),
        membership() {
            if (!this.veStore.lock) return;
            const price = this.liquidityStore.pricing['20USDC-80THX'];
            const amount = Number(fromWei(String(this.veStore.lock.amount)));
            const amountInUSD = amount * price;

            if (amountInUSD < 5) return 'No Rank';
            if (amountInUSD > 5 && amountInUSD < 50) return 'Rookie';
            if (amountInUSD > 50 && amountInUSD < 500) return 'Pro';
            if (amountInUSD > 500 && amountInUSD < 5000) return 'Elite';
            if (amountInUSD > 5000 && amountInUSD < 50000) return 'Master';
            if (amountInUSD > 50000 && amountInUSD < 500000) return 'Legend';
        },
    },
    methods: {},
});
</script>

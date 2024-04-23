<template>
    <BaseDropdownMetric
        label="APR"
        :value="`${aprMetric.totalMin}% - ${aprMetric.totalMax}%`"
        :metrics="[
            {
                label: 'Balancer APR',
                url: 'https://app.balancer.fi/#/polygon/pool/0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe',
                badge: '',
                data: [
                    { label: 'Min BAL APR', value: `${aprMetric.balancerMin}%` },
                    { label: 'Max BAL APR', value: `${aprMetric.balancerMax}%` },
                    { label: 'Swap Fees APR', value: `${aprMetric.balancerSwapFees}%` },
                ],
            },
            {
                label: 'THX Network APR',
                url: 'https://docs.thx.network',
                badge: '',
                data: [{ label: 'VeTHX APR', value: `${aprMetric.thx}%` }],
            },
        ]"
        class="me-4"
    />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useLiquidityStore } from '../../stores/Liquidity';

export default defineComponent({
    name: 'BaseDropdownMetricAPR',
    computed: {
        ...mapStores(useLiquidityStore),
        aprMetric() {
            const { balancer, thx } = this.liquidityStore.apr;
            return {
                balancerMin: balancer.min.toFixed(2),
                balancerMax: balancer.max.toFixed(2),
                balancerSwapFees: balancer.swapFees.toFixed(2),
                thx: thx.toFixed(2),
                totalMin: (balancer.min + balancer.swapFees + thx).toFixed(2),
                totalMax: (balancer.max + balancer.swapFees + thx).toFixed(2),
            };
        },
    },
});
</script>

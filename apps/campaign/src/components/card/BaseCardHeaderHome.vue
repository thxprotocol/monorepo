<template>
    <BaseCardHeader>
        <template #primary>
            <h1 class="text-opaque">Join today!</h1>
            <p class="lead mb-4">
                Members earn weekly rewards and gain access to exclusive quests &amp; rewards of listed projects.
            </p>
            <div class="d-flex">
                <div class="d-block-inline rounded fw-normal text-start" variant="primary">
                    <div class="small text-opaque">
                        APR
                        <i class="fas fa-question-circle" />
                    </div>
                    <div class="lead fw-bold">
                        <span>{{ aprLabel }}</span>
                    </div>
                </div>
                <div class="d-block-inline rounded fw-normal text-start ms-5" variant="primary">
                    <div class="small text-opaque">
                        TVL
                        <i class="fas fa-question-circle" />
                    </div>
                    <div class="lead fw-bold">
                        <span>{{ tvlLabel }}</span>
                    </div>
                </div>
            </div>
        </template>
        <template #secondary>
            <BaseCardMembershipOnboarding />
        </template>
    </BaseCardHeader>
</template>

<script lang="ts">
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';
import { toFiatPrice } from '@thxnetwork/campaign/utils/price';
import { formatUnits } from 'ethers/lib/utils';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCardHeaderHome',
    data() {
        return {
            isPopoverAPRShown: false,
        };
    },
    computed: {
        ...mapStores(useLiquidityStore),
        aprLabel() {
            const { balancer } = this.liquidityStore.apr;
            return balancer.min.toFixed(2) + '% - ' + balancer.max.toFixed(2) + '%';
        },
        tvlLabel() {
            const tvlInWei = formatUnits(this.liquidityStore.tvl, 18).toString();
            const bptPrice = this.liquidityStore.pricing['20USDC-80THX'];
            return toFiatPrice(Number(tvlInWei) * bptPrice);
        },
    },
});
</script>

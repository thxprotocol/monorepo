<template>
    <BaseCardHeader>
        <template #primary>
            <h1 class="text-opaque">Join today!</h1>
            <p class="lead mb-4">
                Members earn weekly rewards and gain access to exclusive quests &amp; rewards of listed projects.
            </p>
            <div class="d-flex">
                <BaseDropdownMetricRewards />
                <BaseDropdownMetricAPR />
                <BaseDropdownMetricTVL />
            </div>
            <div class="mt-5">
                <div class="text-opaque mb-2">Trusted by</div>
                <div class="d-flex align-items-center">
                    <b-img
                        v-b-tooltip
                        :src="imgLogoEU"
                        height="30"
                        class="me-4"
                        title="We have received funding from the European Union under agreement 82888 (Blockpool) and 824509 (Block.IS)
"
                    />
                    <b-img
                        v-b-tooltip
                        :src="imgLogoTS"
                        height="20"
                        class="me-4"
                        title="We're backed by Techstars, one of the largest pre-seed investors in the world, 2022 cohort."
                    />
                    <b-img v-b-tooltip :src="imgLogoPV" height="30" class="me-4" title="" />
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
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import imgLogoEU from '@thxnetwork/campaign/assets/logo-eu.png';
import imgLogoTS from '@thxnetwork/campaign/assets/logo-ts.png';
import imgLogoPV from '@thxnetwork/campaign/assets/logo-pv.png';

export default defineComponent({
    name: 'BaseCardHeaderHome',
    data() {
        return {
            isPopoverAPRShown: false,
            imgLogoEU,
            imgLogoTS,
            imgLogoPV,
        };
    },
    computed: {
        ...mapStores(useLiquidityStore),
    },
});
</script>

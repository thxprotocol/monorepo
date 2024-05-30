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
                    <b-link
                        v-b-tooltip
                        title="We have received funding from the European Union under agreement 82888 (Blockpool) and 824509 (Block.IS)"
                        href="https://docs.thx.network/faq/memberships#secured-and-backed-by-the-best"
                    >
                        <b-img :src="imgLogoEU" height="30" class="me-4" />
                    </b-link>
                    <b-link
                        v-b-tooltip
                        title="We're backed by Techstars, one of the largest pre-seed investors in the world, 2022 cohort."
                        href="https://docs.thx.network/faq/memberships#secured-and-backed-by-the-best"
                    >
                        <b-img :src="imgLogoTS" height="20" class="me-4" />
                    </b-link>
                    <b-link href="https://docs.thx.network/faq/memberships#secured-and-backed-by-the-best">
                        <b-img v-b-tooltip :src="imgLogoPV" height="30" class="me-4" title="" />
                    </b-link>
                </div>
            </div>
        </template>
        <template #secondary>
            <BaseCardMembership />
        </template>
    </BaseCardHeader>
</template>

<script lang="ts">
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import imgLogoEU from '@thxnetwork/app/assets/logo-eu.png';
import imgLogoTS from '@thxnetwork/app/assets/logo-ts.png';
import imgLogoPV from '@thxnetwork/app/assets/logo-pv.png';

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

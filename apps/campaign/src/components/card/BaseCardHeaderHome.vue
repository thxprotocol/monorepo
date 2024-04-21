<template>
    <BaseCardHeader>
        <template #primary>
            <h1 class="text-opaque">Join today!</h1>
            <p class="lead mb-4">
                Members earn weekly rewards and gain access to exclusive quests &amp; rewards of listed projects.
            </p>
            <div class="d-flex">
                <BaseDropdownMetricAPR />
                <BaseDropdownMetricTVL />
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

export default defineComponent({
    name: 'BaseCardHeaderHome',
    data() {
        return {
            isPopoverAPRShown: false,
        };
    },
    computed: {
        ...mapStores(useLiquidityStore),
    },
});
</script>

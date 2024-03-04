<template>
    <BaseCardReward :reward="reward" :image="reward.image">
        <template #title>
            <div class="flex-grow-1">{{ reward.title }}</div>
        </template>
    </BaseCardReward>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardRewardCoupon',
    props: {
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
    },
});
</script>

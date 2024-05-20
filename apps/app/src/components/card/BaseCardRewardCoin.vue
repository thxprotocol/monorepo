<template>
    <BaseCardReward :reward="reward" :image="reward.image">
        <template #title>
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-accent fw-bold">{{ reward.amount }} {{ reward.erc20 && reward.erc20.symbol }}</div>
        </template>
    </BaseCardReward>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardRewardCoin',
    props: {
        reward: {
            type: Object as PropType<TRewardCoin>,
            required: true,
        },
    },
});
</script>

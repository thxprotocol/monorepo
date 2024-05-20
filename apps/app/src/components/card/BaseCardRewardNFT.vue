<template>
    <BaseCardReward :reward="reward" :image="imgUrl">
        <template #title>
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div v-if="reward.erc1155Amount" class="text-success fw-bold">{{ reward.erc1155Amount }}x</div>
        </template>
    </BaseCardReward>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardRewardNFT',
    props: {
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
    },
    computed: {
        imgUrl() {
            return this.reward.image || (this.reward.metadata && this.reward.metadata.imageUrl);
        },
    },
});
</script>

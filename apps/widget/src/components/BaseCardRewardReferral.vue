<template>
    <b-card bg-variant="light" class="m-2">
        <b-card-title class="d-flex">
            <div>
                <img
                    class="img-brand"
                    :src="`https://avatars.dicebear.com/api/identicon/${reward.brand}.svg`"
                    :alt="String(reward.brand)"
                />
            </div>
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-success">{{ reward.amount }}</div>
        </b-card-title>
        <b-card-text>
            {{ reward.description }}
        </b-card-text>
        <b-button variant="primary" block class="w-100" :disabled="reward.claimed" @click="onClick">
            <template v-if="reward.claimed"> Claimed </template>
            <template v-else>
                Claim
                <strong>{{ reward.amount }} points</strong>
            </template>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useRewardStore } from '../stores/Reward';
import { RewardVariant } from '../utils/rewards';
import { Brands } from '../utils/social';

interface IReward {
    amount: number;
    title: string;
    description: string;
    variant: RewardVariant;
    claimed: boolean;
    brand: Brands;
}

export default defineComponent({
    name: 'BaseCardRewardReferral',
    props: {
        reward: {
            type: Object as PropType<IReward>,
            required: true,
        },
    },
    computed: {
        ...mapStores(useRewardStore),
    },
    methods: {
        onClick: () => {
            // signin
        },
    },
});
</script>

<style scoped lang="scss">
.img-brand {
    width: 25px;
    height: 25px;
    display: block;
    margin-right: 0.5rem;
}
</style>

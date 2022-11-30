<template>
    <b-card bg-variant="light" class="m-2">
        <b-card-title class="d-flex">
            <div>
                <img
                    class="img-brand"
                    :src="`https://avatars.dicebear.com/api/identicon/${reward.brand}.svg`"
                    :alt="String(reward.platform)"
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

export default defineComponent({
    name: 'BaseCardRewardReferral',
    props: {
        reward: {
            type: Object as PropType<TPointReward>,
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
.btn {
    border: 0;
    padding: 0.8rem 1rem;
}
.btn-primary {
    background-color: #5942c1;
    border-radius: 25px;
}

p {
    font-size: 0.9rem;
}
</style>

<template>
    <b-card bg-variant="light" class="m-2">
        <b-card-title class="d-flex">
            <div>
                <img
                    class="img-brand"
                    :src="`https://avatars.dicebear.com/api/identicon/${reward.platform}.svg`"
                    :alt="reward.platform"
                />
            </div>
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-success">{{ reward.amount }}</div>
        </b-card-title>

        <b-card-text>
            {{ reward.description }}
        </b-card-text>

        <b-input-group v-if="accountStore.isAuthenticated" size="sm">
            <b-form-input :model-value="`${baseUrl}${reward._id}`" size="sm" />
            <b-input-group-append>
                <b-button size="sm" variant="primary">
                    <i class="fas fa-clipboard"></i>
                </b-button>
            </b-input-group-append>
        </b-input-group>

        <b-button v-else variant="primary" block class="w-100" @click="accountStore.api.signin()">
            Claim <strong>{{ reward.amount }} points</strong>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';

export default defineComponent({
    name: 'BaseCardRewardReferral',
    props: {
        reward: {
            type: Object as PropType<TPointReward>,
            required: true,
        },
    },
    data: () => {
        return { baseUrl: 'https://xyz.com?referral=' };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
    },
    methods: {
        onClick: function () {
            if (this.accountStore.isAuthenticated) {
                alert('authenticated');
            } else {
                alert('not authenticated');
            }
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
}
.form-control {
    border-color: #241956;
    background-color: #241956;
    color: white;
}
.btn-block {
    border-radius: 25px;
}

p {
    font-size: 0.9rem;
}
</style>

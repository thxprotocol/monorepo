<template>
    <b-card class="m-2 disabled">
        <b-card-title class="d-flex">
            <div class="flex-grow-1 pe-2">{{ reward.title }}</div>
            <div class="text-success fw-bold">{{ reward.amount }}</div>
        </b-card-title>

        <b-card-text>
            {{ reward.description }}
        </b-card-text>

        <b-alert class="p-2" v-if="error && !isSubmitting" variant="danger" show>
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <b-button v-if="!accountStore.isAuthenticated" @click="onClickSignin" variant="primary" block class="w-100">
            Claim <strong>{{ reward.amount }} points</strong>
        </b-button>

        <b-button
            v-if="accountStore.isAuthenticated && !reward.isClaimed"
            variant="primary"
            block
            class="w-100"
            @click="onClickClaim"
            :disabled="isSubmitting"
        >
            <template v-if="isSubmitting">
                <b-spinner small></b-spinner>
                Adding points...
            </template>
            <template v-else>
                Claim
                <strong>{{ reward.amount }} points </strong>
            </template>
        </b-button>

        <b-button v-else variant="primary" block class="w-100" disabled> Not available </b-button>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';

export default defineComponent({
    name: 'BaseCardRewardDaily',
    props: {
        reward: {
            type: Object as PropType<TDailyReward>,
            required: true,
        },
    },
    data: function (): any {
        return { error: '', isSubmitting: false };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
    },
    methods: {
        onClickSignin: function () {
            this.accountStore.api.userManager.cached.signinPopup();
        },
        onClickClaim: async function () {
            try {
                this.error = '';
                this.isSubmitting = true;
                await this.rewardsStore.claimDailyReward(this.reward);
            } catch (error) {
                this.error = error;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>

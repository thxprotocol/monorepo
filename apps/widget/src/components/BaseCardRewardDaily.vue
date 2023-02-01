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

        <b-progress
            v-if="accountStore.isAuthenticated && reward.claims.length"
            class="mb-3"
            variant="success"
            :value="reward.claims.length"
            :max="7"
            show-value
        ></b-progress>

        <b-button v-if="!accountStore.isAuthenticated" @click="onClickSignin" variant="primary" block class="w-100">
            Claim <strong>{{ reward.amount }} points</strong>
        </b-button>

        <b-button
            v-if="accountStore.isAuthenticated"
            variant="primary"
            block
            class="w-100"
            @click="onClickClaim"
            :disabled="isSubmitting || reward.isDisabled"
        >
            <template v-if="reward.isDisabled && waitDuration">
                Wait for {{ waitDuration.hours }}: {{ waitDuration.minutes }}:{{ waitDuration.seconds }}
            </template>
            <template v-else-if="isSubmitting"><b-spinner small></b-spinner> Adding points...</template>
            <template v-else>
                Claim <strong>{{ reward.amount }} points </strong>
            </template>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import { intervalToDuration, sub } from 'date-fns';

export default defineComponent({
    name: 'BaseCardRewardDaily',
    props: {
        reward: {
            type: Object as PropType<TDailyReward>,
            required: true,
        },
    },
    data: function (): any {
        return { error: '', isSubmitting: false, secondsToSubtract: 0 };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        waitDuration: function () {
            if (!this.reward.claimAgainTime) return;

            const claimAgainDate = sub(new Date(this.reward.claimAgainTime), { seconds: this.secondsToSubtract });
            const waitInMs = claimAgainDate.getTime() - Date.now();
            const { hours, minutes, seconds } = intervalToDuration({ start: 0, end: waitInMs });

            return {
                hours: String(hours).padStart(2, '0'),
                minutes: String(minutes).padStart(2, '0'),
                seconds: String(seconds).padStart(2, '0'),
            };
        },
    },
    mounted() {
        setInterval(() => this.secondsToSubtract++, 1000);
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

<template>
    <BaseCardCollapse :visible="accountStore.isAuthenticated && !waitDuration">
        <template #header>
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fa fa-calendar me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ reward.title }}</div>
            <div class="text-accent fw-bold">{{ reward.amount }}</div>
        </template>

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
            Sign in &amp; claim <strong>{{ reward.amount }} points</strong>
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
            <template v-else-if="reward.isDisabled && !waitDuration"> Not available </template>
            <template v-else-if="isSubmitting"><b-spinner small></b-spinner> Adding points...</template>
            <template v-else>
                Claim <strong>{{ reward.amount }} points </strong>
            </template>
        </b-button>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import { intervalToDuration, sub } from 'date-fns';
import BaseCardCollapse from '../components/BaseCardCollapse.vue';

export default defineComponent({
    name: 'BaseCardRewardDaily',
    components: {
        BaseCardCollapse,
    },
    props: {
        visible: {
            type: Boolean,
        },
        reward: {
            type: Object as PropType<TDailyReward>,
            required: true,
        },
    },
    data: function (): any {
        return {
            interval: null,
            error: '',
            isSubmitting: false,
            secondsToSubtract: 0,
            now: Math.floor(Date.now() / 1000),
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        waitDuration: function () {
            if (!this.reward.claimAgainDuration) return;

            const end = Date.now() + this.reward.claimAgainDuration * 1000;
            const { hours, minutes, seconds } = intervalToDuration({
                start: Math.floor(Date.now() / 1000) * 1000, // Convert to s, round down and convert back to ms
                end: sub(end, { seconds: this.secondsToSubtract }),
            });

            return {
                hours: String(hours).padStart(2, '0'),
                minutes: String(minutes).padStart(2, '0'),
                seconds: String(seconds).padStart(2, '0'),
            };
        },
    },
    created() {
        this.interval = setInterval(() => {
            this.secondsToSubtract = this.secondsToSubtract + 1;
        }, 1000);
    },
    beforeUnmount() {
        clearInterval(this.interval);
    },
    methods: {
        onClickSignin: function () {
            this.accountStore.signin();
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

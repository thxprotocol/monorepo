<template>
    <BaseCardCollapse
        @modal-close="isModalQuestEntryShown = false"
        :quest="quest"
        :id="quest._id"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :amount="quest.amount"
        :image="quest.image"
        :error="error"
        :info-links="quest.infoLinks"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
    >
        <template #header>
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fa fa-calendar me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ quest.title }}</div>
            <div class="text-accent fw-bold">{{ quest.amount }}</div>
        </template>

        <b-card-text v-if="quest.description" style="white-space: pre-line" v-html="quest.description" />

        <b-alert class="p-2" v-if="error && !isSubmitting" variant="danger" show>
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <div class="d-flex flex-wrap pb-3 justify-content-between">
            <b-badge
                style="width: 40px; height: 40px"
                class="m-1 d-flex flex-column align-items-center justify-content-center"
                :variant="key < quest.entries.length ? 'success' : 'primary'"
                :class="key < quest.entries.length ? 'bg-success text-white' : 'bg-primary text-white'"
                v-for="(amount, key) of quest.amounts"
            >
                <small>Day {{ key + 1 }}</small>
                <strong class="h5 mb-0">{{ amount }}</strong>
            </b-badge>
        </div>

        <template #button>
            <b-button
                v-if="!accountStore.isAuthenticated"
                v-b-modal="'modalLogin'"
                variant="primary"
                class="w-100"
                block
            >
                Sign in &amp; claim <strong>{{ quest.amounts[0] }} points</strong>
            </b-button>

            <BaseButtonQuestLocked v-else-if="quest.isLocked" :quest="quest" />

            <b-button
                v-else
                class="w-100"
                block
                variant="primary"
                @click="onClickClaim"
                :disabled="isSubmitting || !quest.isAvailable"
            >
                <template v-if="!quest.isAvailable && waitDuration">
                    Wait for {{ waitDuration.hours }}: {{ waitDuration.minutes }}:{{ waitDuration.seconds }}
                </template>
                <template v-else-if="!quest.isAvailable && !waitDuration"> Not available </template>
                <template v-else-if="isSubmitting"><b-spinner small></b-spinner> Adding points...</template>
                <template v-else>
                    Claim <strong>{{ quest.amount }} points </strong>
                </template>
            </b-button>
        </template>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { useAuthStore } from '../../stores/Auth';
import { intervalToDuration, sub } from 'date-fns';

export default defineComponent({
    name: 'BaseCardQuestDaily',
    props: {
        visible: {
            type: Boolean,
        },
        quest: {
            type: Object as PropType<TQuestDaily>,
            required: true,
        },
    },
    data(): {
        interval: any;
        error: string;
        isSubmitting: boolean;
        secondsToSubtract: number;
        now: number;
        isModalQuestEntryShown: boolean;
    } {
        return {
            interval: null,
            error: '',
            isSubmitting: false,
            secondsToSubtract: 0,
            now: Math.floor(Date.now() / 1000),
            isModalQuestEntryShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        waitDuration: function () {
            if (!this.quest.claimAgainDuration) return;

            const end = Date.now() + this.quest.claimAgainDuration * 1000;
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
                this.isModalQuestEntryShown = true;
                await this.questStore.completeDailyQuest(this.quest);
            } catch (error) {
                this.error = String(error);
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>

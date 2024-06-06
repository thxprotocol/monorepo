<template>
    <BaseCardQuest
        :id="quest._id"
        :quest="quest"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :error="error"
        @modal-close="isModalQuestEntryShown = false"
    >
        <div class="d-flex flex-wrap pb-3 justify-content-start">
            <b-badge
                v-for="(amount, key) of quest.amounts"
                style="width: 50px; height: 50px"
                class="my-1 me-3 d-flex flex-column align-items-center justify-content-center"
                :variant="key < quest.entries.length ? 'success' : 'primary'"
                :class="key < quest.entries.length ? 'bg-success text-white' : 'bg-primary text-white'"
            >
                <small>Day {{ key + 1 }}</small>
                <strong class="h5 mb-0">{{ amount }}</strong>
            </b-badge>
        </div>

        <template #button>
            <b-button
                class="w-100"
                block
                variant="primary"
                :disabled="isSubmitting || !quest.isAvailable"
                @click="onClickClaim"
            >
                <template v-if="!quest.isAvailable && waitDuration">
                    Wait for {{ waitDuration.hours }}: {{ waitDuration.minutes }}:{{ waitDuration.seconds }}
                </template>
                <template v-else-if="!quest.isAvailable && !waitDuration"> Not available </template>
                <template v-else-if="isSubmitting"><b-spinner small></b-spinner> Adding points...</template>
                <template v-else-if="quest.amount">
                    Claim <strong>{{ quest.amount }} points </strong>
                </template>
                <template v-else>Complete Quest</template>
            </b-button>
        </template>
    </BaseCardQuest>
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
        ...mapStores(useAccountStore, useAuthStore, useQuestStore),
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
                await this.questStore.completeQuest(this.quest);
                this.isModalQuestEntryShown = true;
            } catch (error) {
                this.error = String(error);
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>

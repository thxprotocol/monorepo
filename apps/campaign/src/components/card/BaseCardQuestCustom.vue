<template>
    <BaseCardCollapse
        @modal-close="isModalQuestEntryShown = false"
        :id="quest._id"
        :quest="quest"
        :amount="quest.amount"
        :image="quest.image"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :error="error"
        :info-links="quest.infoLinks"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
    >
        <template #header>
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fas fa-flag me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ quest.title }}</div>
            <div class="text-accent fw-bold">{{ quest.amount }}</div>
        </template>

        <b-card-text v-if="quest.description" style="white-space: pre-line" v-html="quest.description" />

        <b-progress v-if="accountStore.isAuthenticated && quest.limit" class="mb-3" :max="quest.limit" show-value>
            <b-progress-bar variant="primary" :value="quest.entries.length" :label="`${quest.events.length}`" />
            <b-progress-bar variant="success" :value="pendingCount" :label="`${pendingCount}`" />
        </b-progress>

        <template #button>
            <b-button v-if="!authStore.oAuthShare" @click="onClickSignin" variant="primary" block class="w-100">
                Sign in &amp; claim <strong>{{ quest.amount }} points</strong>
            </b-button>

            <BaseButtonQuestLocked v-else-if="quest.isLocked" :quest="quest" />

            <b-button v-else-if="!pendingCount" variant="primary" class="w-100" block disabled>
                Not available
            </b-button>

            <b-button v-else variant="primary" block class="w-100" @click="onClickClaim" :disabled="isSubmitting">
                <template v-if="isSubmitting">
                    <b-spinner small></b-spinner>
                    Adding points...
                </template>
                <template v-else>
                    Claim
                    <strong>
                        {{ `${pendingCount} x` }}
                        {{ quest.amount }} points
                    </strong>
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

export default defineComponent({
    name: 'BaseCardQuestCustom',
    props: {
        quest: {
            required: true,
            type: Object as PropType<TQuestCustom>,
        },
    },
    data(): { error: string; isSubmitting: boolean; isModalQuestEntryShown: boolean } {
        return { error: '', isSubmitting: false, isModalQuestEntryShown: false };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        pendingCount() {
            // If there is a limit subtract the amount of entries from the amount of events
            if (this.quest.limit > 0) return this.quest.events.length - this.quest.entries.length;
            // Else return the amount of events
            return this.quest.events.length - this.quest.entries.length;
        },
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
                await this.questStore.completeCustomQuest(this.quest);
            } catch (error) {
                this.error = error as string;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>

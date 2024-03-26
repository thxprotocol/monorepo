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
        <b-progress v-if="accountStore.isAuthenticated && quest.limit > 0" class="mb-3" :max="quest.limit" show-value>
            <b-progress-bar variant="primary" :value="quest.entries.length" :label="`${quest.events.length}`" />
            <b-progress-bar variant="success" :value="pendingCount" :label="`${pendingCount}`" />
        </b-progress>

        <template #button>
            <b-button variant="primary" block class="w-100" :disabled="isSubmitting" @click="onClickClaim">
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
    </BaseCardQuest>
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
    data() {
        return { error: '', isSubmitting: false, isModalQuestEntryShown: false };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore),
        pendingCount() {
            // If there is a limit subtract the amount of entries from the amount of events
            if (this.quest.limit > 0) return this.quest.events.length - this.quest.entries.length;
            // Else return the amount of events
            const pending = this.quest.events.length - this.quest.entries.length;
            // In case it's less than 0 return 0
            return pending < 0 ? 0 : pending;
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
                await this.questStore.completeQuest(this.quest);
                this.isModalQuestEntryShown = true;
            } catch (error) {
                this.error = error as string;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>

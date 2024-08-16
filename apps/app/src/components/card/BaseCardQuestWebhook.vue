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
        <template #button>
            <b-button variant="primary" block class="w-100" :disabled="isSubmitting" @click="onClick">
                <b-spinner v-if="isSubmitting" small />
                <template v-else-if="quest.amount">
                    Earn <strong>{{ quest.amount }}</strong> points
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

export default defineComponent({
    name: 'BaseCardQuestWebhook',
    props: {
        quest: {
            required: true,
            type: Object as PropType<TQuestWebhook>,
        },
    },
    data() {
        return { error: '', isSubmitting: false, isModalQuestEntryShown: false };
    },
    computed: {
        ...mapStores(useAccountStore, useQuestStore),
    },
    methods: {
        async onClick() {
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

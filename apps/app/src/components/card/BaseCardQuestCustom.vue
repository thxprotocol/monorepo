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
        <!-- <b-progress v-if="accountStore.isAuthenticated && quest.limit > 0" class="mb-3" :max="quest.limit" show-value>
            <b-progress-bar variant="primary" :value="quest.entries.length" :label="`${quest.events.length}`" />
            <b-progress-bar variant="success" :value="pendingCount" :label="`${pendingCount}`" />
        </b-progress> -->

        <template #button>
            <!-- <b-button variant="primary" block class="w-100" :disabled="isSubmitting" @click="onClickClaim">
                <b-spinner v-if="isSubmitting" small />
                <template v-else-if="quest.amount">
                    Earn
                    <strong>
                        {{ `${pendingCount} x` }}
                        {{ formattedAmount }}
                    </strong>
                </template>
                <template v-else>Complete Quest</template>
            </b-button> -->
            <!-- Button to open the modal -->
            <b-button
                block
                class="w-100"
                :class="{
                    'locked-btn': isSubmitting || pendingCount === 0,
                    'btn-primary': !(isSubmitting || pendingCount === 0),
                }"
                @click="isModalVisible = true"
            >
                {{ pendingCount !== 0 ? `Claim ` : `Earn` }} {{ formattedAmount }} Pts
            </b-button>
        </template>
    </BaseCardQuest>
    <b-modal v-model="isModalVisible" centered title="Quest Details" hide-footer @hide="resetModal">
        <template #header>
            <h5 class="modal-title">{{ groupTitle }}</h5>
            <b-link class="btn-close" @click.prevent="isModalVisible = false">
                <i class="fas fa-times" />
            </b-link>
        </template>
        <div class="d-flex justify-content-center overflow-hidden">
            <img v-if="quest.image" :src="quest.image" :alt="quest.title" style="border-radius: 10px" />
        </div>
        <div class="d-flex flex-column mt-3">
            <p class="quest-modal-title">{{ quest.title }}</p>
            <p class="quest-modal-text">{{ quest.description }}</p>
            <p class="quest-modal-text" :class="{ 'mb-5': !quest.description.includes('week') }">
                You can earn
                <span class="text-accent"
                    ><strong>{{ formattedAmount }}</strong></span
                >
                points
            </p>
            <p v-if="quest.description.includes('week')" class="quest-modal-text mb-5">
                You can claim the points every weekend as it's a weekly quest.
            </p>
        </div>
        <div v-if="error" variant="danger" class="p-2"><i class="fas fa-exclamation-circle me-1"></i> {{ error }}</div>

        <!-- Button inside modal to trigger onClickClaim -->
        <b-button
            variant="primary"
            block
            class="w-100"
            :disabled="isSubmitting || pendingCount === 0"
            @click="onClickClaim"
        >
            <b-spinner v-if="isSubmitting" small />
            <template v-else-if="quest.amount">
                {{ pendingCount !== 0 ? 'Claim' : 'Earn' }}
                <strong>
                    {{ `${pendingCount} x` }}
                    {{ formattedAmount }}
                </strong>
                points
            </template>
            <template v-else>Complete Quest</template>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { useAuthStore } from '../../stores/Auth';
import { CP_CAMPAIGN } from '@thxnetwork/app/config/secrets';

export default defineComponent({
    name: 'BaseCardQuestCustom',
    props: {
        quest: {
            required: true,
            type: Object as PropType<TQuestCustom>,
        },
        groupTitle: {
            type: String,
            required: false,
        },
    },
    data() {
        return { error: '', isSubmitting: false, isModalQuestEntryShown: false, isModalVisible: false };
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
        formattedAmount() {
            if (this.quest.poolId === CP_CAMPAIGN) {
                const amount = this.quest.amount / 100;
                return amount % 1 === 0 ? `$${amount.toFixed(0)}` : `$${amount.toFixed(2)}`;
            }
            return `${this.quest.amount}`;
        },
    },
    methods: {
        onClickClaim: async function () {
            try {
                this.error = '';
                this.isSubmitting = true;
                await this.questStore.completeQuest(this.quest);
                this.isModalQuestEntryShown = true;
            } catch (error) {
                this.error = error?.message || String(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        resetModal() {
            this.isModalVisible = false;
        },
    },
});
</script>
<style>
.no-before::before {
    content: none !important;
}
</style>

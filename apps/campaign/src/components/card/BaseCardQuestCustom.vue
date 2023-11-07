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
        :visible="!!authStore.oAuthShare && pendingClaims > 0"
    >
        <template #header>
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fas fa-flag me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ quest.title }}</div>
            <div class="text-accent fw-bold">{{ quest.amount }}</div>
        </template>

        <b-card-text>
            {{ quest.description }}
        </b-card-text>

        <b-progress
            v-if="authStore.oAuthShare && quest.claims.length"
            class="mb-3"
            variant="success"
            :value="claimedAmount"
            :max="quest.claims.length"
            show-value
        ></b-progress>

        <b-alert class="p-2" v-if="error && !isSubmitting" variant="danger" show>
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <template #button>
            <b-button v-if="!authStore.oAuthShare" @click="onClickSignin" variant="primary" block class="w-100">
                Sign in &amp; claim <strong>{{ quest.amount }} points</strong>
            </b-button>

            <b-button v-else-if="!quest.claims.length || !pendingClaims" variant="primary" block class="w-100" disabled>
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
                        {{ pendingClaims > 1 ? `${quest.claims.length - claimedAmount} x` : '' }}
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
import { useRewardStore } from '../../stores/Reward';
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
        ...mapStores(useRewardStore),
        claimedAmount: function () {
            return this.quest.claims.filter((c: TQuestCustomClaim) => c.isClaimed).length;
        },
        pendingClaims: function () {
            return this.quest.claims.length - this.claimedAmount;
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
                await this.rewardsStore.completeCustomQuest(this.quest);
            } catch (error) {
                this.error = error as string;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>

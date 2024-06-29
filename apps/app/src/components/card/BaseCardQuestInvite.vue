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
        <b-alert v-model="isAlertInviteLinkUsesShown" class="p-2" variant="primary">
            <i class="fas fa-sparkles mx-2" />
            Your Invite Link has been used <strong>{{ quest.uses }} {{ quest.uses > 1 ? 'times' : 'time' }}!</strong>
        </b-alert>
        <BaseFormGroup label="Your Invite Link" tooltip="Your Invite Link ">
            <template v-if="inviteUrl">
                <b-input-group>
                    <b-form-input :model-value="inviteUrl" />
                    <b-input-group-append>
                        <b-button
                            v-clipboard:copy="inviteUrl"
                            v-clipboard:success="onCopySuccess"
                            size="sm"
                            variant="primary"
                        >
                            <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                            <i v-else class="fas fa-clipboard px-2"></i>
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </template>
            <template v-else>
                <b-alert v-model="isAlertInviteURLShown" class="p-2 mb-0" variant="primary">
                    <i class="fas fa-exclamation-circle mx-1" />
                    Sign in to see your Invite Link
                </b-alert>
            </template>
        </BaseFormGroup>

        <!-- <div class="py-2">
            <BaseBtnShareTwitter :url="inviteUrl" text="Please have a look at this:" class="me-2" />
            <BaseBtnShareLinkedin :url="inviteUrl" class="me-2" />
            <BaseBtnShareWhatsapp :url="inviteUrl" class="me-2" />
            <BaseBtnShareTelegram :url="inviteUrl" text="Please have a look at this!" class="me-2" />
            <BaseBtnShareEmail :url="inviteUrl" subject="Please have a look at this!" class="me-2" />
        </div> -->

        <BaseFormGroup
            label="Invitee Requirement"
            tooltip="The invitee needs to complete this quest before points are transferred to both parties."
        >
            {{ requiredQuest.title }}
            <strong>
                <span v-if="requiredQuest.amount" class="text-accent">{{ requiredQuest.amount }}</span>
                <span v-if="quest.amountInvitee" class="text-accent"> + {{ quest.amountInvitee }} </span>
            </strong>
        </BaseFormGroup>

        <template #button>
            <b-button variant="primary" block class="w-100" :disabled="isDisabled" @click="onClick">
                <b-spinner v-if="isSubmitting" small></b-spinner>
                <template v-else>
                    Claim <strong>{{ quest.amount }} points</strong>
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
import { WIDGET_URL } from '../../config/secrets';

export default defineComponent({
    name: 'BaseCardQuestInvite',
    props: {
        quest: {
            type: Object as PropType<TQuestInvite>,
            required: true,
        },
    },
    data() {
        return { error: '', isModalQuestEntryShown: false, isSubmitting: false, isCopied: false };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        isAlertInviteLinkUsesShown() {
            return !!this.quest.uses;
        },
        inviteUrl(): string {
            if (!this.quest.codes.length) return '';
            return WIDGET_URL + `/i/${this.quest.codes[0].code}`;
        },
        isDisabled() {
            return this.isSubmitting || !this.quest.amount;
        },
        requiredQuest() {
            return this.questStore.quests.find((q) => q._id === this.quest.requiredQuest.questId) as TBaseQuest;
        },
        isAlertInviteURLShown() {
            return !this.accountStore.isAuthenticated;
        },
    },
    methods: {
        async onClick() {
            try {
                this.error = '';
                this.isSubmitting = true;
                this.isModalQuestEntryShown = true;
                await this.questStore.completeQuest(this.quest);
            } catch (error) {
                console.error(error);
                this.error = String(error);
            } finally {
                this.isSubmitting = false;
            }
        },
        onCopySuccess() {
            this.isCopied = true;
        },
    },
});
</script>

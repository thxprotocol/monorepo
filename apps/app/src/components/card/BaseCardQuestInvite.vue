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

        <!-- 
        <div class="py-2">
            <BaseBtnShareTwitter :url="inviteUrl" text="Please have a look at this:" class="me-2" />
            <BaseBtnShareLinkedin :url="inviteUrl" class="me-2" />
            <BaseBtnShareWhatsapp :url="inviteUrl" class="me-2" />
            <BaseBtnShareTelegram :url="inviteUrl" text="Please have a look at this!" class="me-2" />
            <BaseBtnShareEmail :url="inviteUrl" subject="Please have a look at this!" class="me-2" />
        </div> 
        -->

        <BaseFormGroup
            label="Requirements"
            tooltip="The invitee needs to complete this quest before points are transferred to both parties."
        >
            {{ requiredQuest.title }}
            <span v-if="requiredQuest.amount" class="me-1">[{{ requiredQuest.amount }}]</span>
            <span v-if="quest.amountInvitee" class="text-accent">+ {{ quest.amountInvitee }}</span>
        </BaseFormGroup>

        <template #button>
            <b-button variant="primary" block class="w-100" :disabled="isSubmitting" @click="onClick">
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
        inviteUrl(): string {
            if (!this.quest.codes.length) return '';
            return WIDGET_URL + `/i/${this.quest.codes[0].code}`;
        },
        isDisabled() {
            return false;
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
                await this.questStore.completeQuest(this.quest);
                this.isModalQuestEntryShown = false;
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

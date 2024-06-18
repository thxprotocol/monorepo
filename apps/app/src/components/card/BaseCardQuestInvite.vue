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
        <template v-if="inviteUrl">
            <BaseFormGroup label="Your Invite Link" tooltip="Your Invite Link ">
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
            </BaseFormGroup>

            <!-- <div class="py-2">
                <BaseBtnShareTwitter :url="inviteUrl" text="Please have a look at this:" class="me-2" />
                <BaseBtnShareLinkedin :url="inviteUrl" class="me-2" />
                <BaseBtnShareWhatsapp :url="inviteUrl" class="me-2" />
                <BaseBtnShareTelegram :url="inviteUrl" text="Please have a look at this!" class="me-2" />
                <BaseBtnShareEmail :url="inviteUrl" subject="Please have a look at this!" class="me-2" />
            </div> -->

            <BaseFormGroup
                label="Requirements"
                tooltip="The invitee needs to complete this quest before points are transferred."
            >
                {{ requiredQuest.title }}
                <span v-if="requiredQuest.amount" class="me-1">[{{ requiredQuest.amount }}]</span>
                <span v-if="quest.amountInvitee" class="text-accent">+ {{ quest.amountInvitee }}</span>
            </BaseFormGroup>
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
            return WIDGET_URL + `/i/${this.quest.codes[0].code}`;
        },
        isDisabled() {
            return false;
        },
        requiredQuest() {
            return this.questStore.quests.find((q) => q._id === this.quest.requiredQuest.questId) as TBaseQuest;
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

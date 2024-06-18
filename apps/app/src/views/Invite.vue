<template>
    <template v-if="invite">
        <b-modal v-model="isShown" centered>
            <template #title>
                You have been invited by <strong>{{ invite.account.username }}!</strong>
            </template>
            <b-alert v-model="isAlertErrorShown">
                <i class="fas fa-exclamation-circle me-1" />
                {{ error }}
            </b-alert>
            <span v-if="invite">
                <b-alert v-model="isAlertPrimaryShown" variant="primary" class="p-2">
                    <i class="fas fa-exclamation-circle mx-2"></i>
                    Hi!👋 Complete the <strong>"{{ invite.requiredQuest.title }}"</strong> quest.
                    <strong>{{ invite.requiredQuest.amount }}</strong>
                </b-alert>
                <ul class="m-0">
                    <li>
                        <strong>{{ invite.account.username }}</strong> will earn
                        <strong class="text-accent">{{ invite.quest.amount }}</strong> points<br />
                    </li>
                    <li>
                        You earn
                        <strong class="text-accent">{{ invite.quest.amountInvitee }}</strong> bonus points
                    </li>
                </ul>
            </span>
            <template #footer>
                <b-button variant="success" class="w-100"> Continue </b-button>
            </template>
        </b-modal>
    </template>
</template>
<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useAuthStore } from '../stores/Auth';
import { useAccountStore } from '../stores/Account';

export default defineComponent({
    data() {
        return {
            error: '',
            invite: null as { account: TAccount; quest: TQuestInvite; requiredQuest: TBaseQuest } | null,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
        isShown() {
            return true;
        },
        isAlertErrorShown() {
            return !!this.error;
        },
        isAlertPrimaryShown() {
            return !this.error;
        },
    },
    async mounted() {
        try {
            this.isLoading = true;
            this.invite = await this.accountStore.api.request.get(`/v1/invites/${this.$route.params.code}`);
        } catch (error) {
            this.error = String(error);
        } finally {
            this.isLoading = false;
        }
    },
});
</script>

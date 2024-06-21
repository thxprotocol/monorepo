<template>
    <b-modal v-if="invite" v-model="isShown" centered no-close-on-backdrop no-close-on-esc>
        <template #header>
            <b-card-title class="text-accent">
                Hi!👋 You have been invited by <strong>{{ invite.account.username }}!</strong>
            </b-card-title>
        </template>
        <b-alert v-model="isAlertErrorShown">
            <i class="fas fa-exclamation-circle me-1" />
            {{ error }}
        </b-alert>
        <span v-if="invite">
            <b-alert v-model="isAlertPrimaryShown" variant="primary" class="p-2">
                <i class="fas fa-exclamation-circle mx-2"></i>
                Complete quest <strong>"{{ invite.requiredQuest.title }}"</strong> in
                <strong>{{ decode(invite.campaign.title) }}</strong>
            </b-alert>
            <ul class="m-0">
                <li>
                    You earn
                    <strong class="text-accent">{{ invite.quest.amountInvitee }}</strong> bonus points
                </li>
                <li>
                    <strong>{{ invite.account.username }}</strong> earns
                    <strong class="text-accent">{{ invite.quest.amount }}</strong> points<br />
                </li>
            </ul>
        </span>
        <template #footer>
            <b-button
                v-if="!accountStore.isAuthenticated"
                variant="primary"
                class="w-100"
                @click="authStore.isModalLoginShown = true"
            >
                Sign in <i class="fas fa-chevron-right ms-2" />
            </b-button>
            <b-button v-else :to="campaignPath" variant="success" class="w-100">
                Continue <i class="fas fa-chevron-right ms-2" />
            </b-button>
        </template>
    </b-modal>
</template>
<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import { decode } from 'html-entities';

export default defineComponent({
    props: {
        show: Boolean,
    },
    data() {
        return {
            decode,
            error: '',
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
        invite() {
            return this.accountStore.invite;
        },
        isShown() {
            return this.show;
        },
        campaignPath() {
            return this.invite ? `/c/${this.invite.campaign.slug}` : '';
        },
        isAlertErrorShown() {
            return !!this.error;
        },
        isAlertPrimaryShown() {
            return !this.error;
        },
    },
    watch: {
        'accountStore.isAuthenticated': {
            handler: async function (isAuthenticated: boolean) {
                if (!this.invite) {
                    await this.getInvite();
                }
                if (!isAuthenticated) return;

                if (this.invite) {
                    await this.setInviteCode();
                }
            },
            immediate: true,
        },
    },
    methods: {
        async setInviteCode() {
            try {
                if (!this.invite) {
                    throw new Error('No invite found');
                }

                // Create or read participant info for this user
                await this.accountStore.getParticipants(this.invite.quest.poolId);

                // Get participant info from state
                const participant = this.accountStore.participants.find(
                    (p) => this.invite && p.poolId === this.invite.quest.poolId,
                );
                if (!participant) {
                    throw new Error('No participant found');
                }

                // Update participant with invite code
                await this.accountStore.api.request.patch(`/v1/participants/${participant._id}/`, {
                    data: { inviteCode: this.$route.params.code },
                });
            } catch (error) {
                console.error(error);
            }
        },
        async getInvite() {
            try {
                this.isLoading = true;
                await this.accountStore.getInvite(this.$route.params.code as string);
            } catch (error) {
                this.error = String(error);
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

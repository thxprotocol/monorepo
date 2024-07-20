<template>
    <b-form-group>
        <div
            v-for="participant of accountStore.participants"
            class="d-flex justify-content-between align-items-center py-2"
        >
            <span v-if="participant.campaign">
                <span v-if="participant.campaign.title">
                    {{ participant.campaign.title }}
                </span>
                <span v-else class="text-opaque"> Not available </span>
                <sup class="text-accent ms-2"> {{ participant.balance }} points</sup>
            </span>
            <b-button
                size="sm"
                :variant="participant.isSubscribed ? 'link' : 'primary'"
                :disabled="isLoading"
                class="text-decoration-none"
                @click="onClickSubscribe(participant._id, !participant.isSubscribed)"
            >
                {{ participant.isSubscribed ? 'Unsubscribe' : 'Subscribe' }}
            </b-button>
        </div>
    </b-form-group>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseFormGroupNotifications',
    data() {
        return {
            error: '',
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isErrorShown() {
            return !!this.error.length;
        },
    },
    mounted() {
        this.accountStore.getParticipants();
    },
    methods: {
        async onClickSubscribe(participantId: string, isSubscribed: boolean) {
            try {
                this.isLoading = true;
                if (!this.accountStore.account || !this.accountStore.account.email) {
                    throw new Error('Please, set an e-mail address');
                }

                await this.accountStore.api.request.patch(`/v1/participants/${participantId}`, {
                    data: {
                        isSubscribed,
                        email: this.accountStore.account ? this.accountStore.account.email : null,
                    },
                });
                await this.accountStore.getParticipants();
            } catch (error) {
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

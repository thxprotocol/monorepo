<template>
    <b-modal
        :id="`quest_complete_${id}`"
        v-model="isShown"
        centered
        no-close-on-backdrop
        no-close-on-esc
        content-class="gradient-shadow-xl"
        @show="onShow"
        @hidden="$emit('hidden')"
    >
        <template #header>
            <h5 class="modal-title">
                {{ loading ? 'Loading...' : error ? 'Quest validation' : 'Quest completed!' }}
            </h5>
            <b-link class="btn-close" @click="isShown = false"><i class="fas fa-times"></i></b-link>
        </template>
        <div v-if="loading" class="text-center">
            <b-spinner show small variant="primary" />
        </div>
        <template v-else>
            <b-alert v-model="isAlertErrorShown" show variant="info" class="p-2 mb-0">
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ error || subscribeError }}
            </b-alert>

            <template v-if="!error">
                <b-alert v-model="isAlertSuccessShown" show variant="success" class="p-2">
                    <i class="fas fa-trophy me-2"></i>
                    You have earned {{ amount }} points
                </b-alert>

                <div v-if="participant && !participant.isSubscribed">
                    <b-form-group
                        class="mb-0"
                        :state="isEmailValid"
                        description="Subscribe and receive e-mail notifications when new quests become available."
                    >
                        <b-form-input v-model="email" type="email" :state="isEmailValid" placeholder="E-mail" />
                    </b-form-group>
                </div>
                <p v-else class="mb-0">Continue collecting points or redeem your points for rewards.</p>
            </template>
        </template>

        <template #footer>
            <b-button
                v-if="participant && !participant.isSubscribed"
                :disabled="isDisabledSubscribe"
                variant="primary"
                class="w-100 rounded-pill"
                @click="onClickSubscribe"
            >
                <b-spinner v-if="isSubmitting" small variant="light" />
                <template v-else>Subscribe</template>
            </b-button>
            <b-button
                :variant="participant && participant.isSubscribed ? 'primary' : 'link'"
                class="w-100 rounded-pill"
                :disabled="isDisabledContinue"
                @click="onClickContinue"
            >
                <b-spinner v-if="isSubmitting" small variant="light" />
                <template v-else>Continue</template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';

export default defineComponent({
    name: 'BaseModalQuestEntry',
    props: {
        id: String,
        amount: Number,
        error: String,
        loading: Boolean,
        show: Boolean,
        quest: {
            type: Object as PropType<TBaseQuest>,
            required: true,
        },
    },
    data() {
        return {
            isShown: false,
            isSubmitting: false,
            isLoadingContinue: false,
            email: '',
            subscribeError: '',
        };
    },
    computed: {
        ...mapStores(useAccountStore, useQuestStore),
        isAlertErrorShown() {
            return !!this.error || !!this.subscribeError;
        },
        isAlertSuccessShown() {
            return !this.error && this.amount && !this.subscribeError;
        },
        isEmailValid: function () {
            if (!this.email) return null;
            return !!this.email;
        },
        participant() {
            const { participants, poolId } = useAccountStore();
            return participants.find((p) => p.poolId === poolId);
        },
        isDisabledSubscribe() {
            return !this.isEmailValid || this.isSubmitting;
        },
        isDisabledContinue() {
            return this.loading || this.isSubmitting;
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        async onShow() {
            if (this.accountStore.account) {
                const { email } = this.accountStore.account;
                this.email = email;
            }
        },
        async onClickSubscribe() {
            this.subscribeError = '';
            this.isSubmitting = true;
            try {
                await this.accountStore.updateParticipant({ email: this.email, isSubscribed: true });
            } catch (response) {
                const { error } = response as any;
                this.subscribeError = error.message;
            } finally {
                this.isSubmitting = false;
            }
        },
        async onClickContinue() {
            try {
                this.isSubmitting = true;
                await this.accountStore.getParticipants();
                await this.questStore.list();
                this.$emit('hidden');
            } catch (error) {
                console.error(error);
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>

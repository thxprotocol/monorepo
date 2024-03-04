<template>
    <b-modal
        :id="id"
        v-model="isModalShown"
        @hidden="isModalShown = false"
        :title="reward.title"
        centered
        content-class="gradient-shadow-xl"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-gift me-2"></i> {{ reward.title }}</h5>
            <b-link class="btn-close" @click="isModalShown = false"><i class="fas fa-times"></i></b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show small variant="primary" />
        </div>
        <template v-else>
            <b-alert v-model="isAlertDangerShown" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
            </b-alert>
            <p :class="!reward.chainId && 'mb-0'">
                Do you want to use {{ reward.pointPrice }} points for <strong>{{ reward.title }} </strong>?
            </p>
            <BaseFormGroupWalletSelect
                v-if="reward.chainId"
                :chain-id="reward.chainId"
                @update="wallet = $event"
                class="mb-0"
            />
        </template>
        <template #footer>
            <b-button variant="success" class="w-100 rounded-pill" :disabled="isDisabled" @click="onSubmit">
                <b-spinner small variant="primary" v-if="isSubmitting" />
                <template v-else-if="reward.isLocked"> <i class="fas fa-lock"></i></template>
                <template v-else> {{ reward.pointPrice }} points</template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useRewardStore } from '../../stores/Reward';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';

export default defineComponent({
    name: 'BaseModalRewardPayment',
    data() {
        return {
            wallet: null,
            isModalShown: false,
            isSubmitting: false,
        };
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
        error: String,
        show: Boolean,
        isLoading: Boolean,
    },
    watch: {
        show(value) {
            this.isModalShown = value;
        },
    },
    computed: {
        ...mapStores(useAccountStore, useRewardStore),
        isDisabled() {
            return this.isLoading || (this.reward.chainId && !this.wallet);
        },
        isAlertDangerShown() {
            return !!this.error;
        },
    },
    methods: {
        async onSubmit() {
            this.isSubmitting = true;
            try {
                const walletStore = useWalletStore();

                await this.rewardStore.createPayment(this.reward.variant, this.reward._id, this.wallet);
                await this.accountStore.getParticipants();

                walletStore.list();

                this.isModalShown = false;
            } catch (error) {
                this.error = error && error.message;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>

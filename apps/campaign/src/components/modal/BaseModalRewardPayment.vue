<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @hidden="$emit('hidden')"
        :title="reward.title"
        centered
        content-class="gradient-shadow-xl"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-gift me-2"></i> {{ reward.title }}</h5>
            <b-link class="btn-close" @click="isShown = false"><i class="fas fa-times"></i></b-link>
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
            <b-button
                variant="success"
                class="w-100 rounded-pill"
                :disabled="isDisabled"
                @click="$emit('submit-redemption', wallet)"
            >
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

export default defineComponent({
    name: 'BaseModalRewardPayment',
    data() {
        return {
            wallet: null,
            isShown: false,
            isSubmitting: false,
        };
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        error: {
            type: String,
        },
        show: {
            type: Boolean,
        },
        isLoading: {
            type: Boolean,
        },
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    computed: {
        ...mapStores(useAccountStore, useRewardStore),
        isDisabled() {
            return this.isLoading || this.reward.isLocked || (this.reward.chainId && !this.wallet);
        },
        isAlertDangerShown() {
            return !!this.error;
        },
    },
});
</script>

<template>
    <b-modal
        :id="id"
        v-model="isModalShown"
        :title="reward.title"
        centered
        content-class="gradient-shadow-xl"
        @hidden="isModalShown = false"
        @show="onShow"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-gift me-2"></i> {{ reward.title }}</h5>
            <b-link class="btn-close" @click="isModalShown = false"><i class="fas fa-times"></i></b-link>
        </template>
        <b-alert v-if="isAlertSuccessShown" v-model="isAlertSuccessShown" show variant="success" class="p-2 mb-0">
            <i class="fas fa-gift me-2"></i>
            Your reward has been successfully purchased!
        </b-alert>
        <template v-else>
            <b-alert v-model="isAlertDangerShown" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
            </b-alert>
            <b-alert v-model="isInsufficientPoints" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                You don't have enough points to purchase this reward.
            </b-alert>
            <p :class="!reward.chainId && 'mb-0'">
                Do you want to use {{ reward.pointPrice }} points for <strong>{{ reward.title }} </strong>?
            </p>
            <BaseFormGroupWalletSelect
                v-if="isWalletRequired"
                :chain-id="reward.chainId"
                class="mb-0"
                @update="wallet = $event"
            />
        </template>
        <template #footer>
            <b-button
                v-if="!isAlertSuccessShown"
                variant="success"
                class="w-100 rounded-pill"
                :disabled="isDisabled"
                @click="onSubmit"
            >
                <b-spinner v-if="isLoading" small variant="primary" />
                <template v-else-if="reward.isLocked"> <i class="fas fa-lock"></i></template>
                <template v-else>
                    Pay {{ reward.pointPrice }} {{ reward.pointPrice === 1 ? 'point' : 'points' }}
                </template>
            </b-button>
            <b-button v-else class="w-100" variant="primary" @click="onClickContinue">Continue</b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useRewardStore } from '../../stores/Reward';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { RewardVariant } from '@thxnetwork/app/types/enums/rewards';

export default defineComponent({
    name: 'BaseModalRewardPayment',
    props: {
        id: {
            type: String,
            required: true,
        },
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
        show: Boolean,
    },
    data() {
        return {
            RewardVariant,
            isAlertSuccessShown: false,
            error: '',
            wallet: null,
            isModalShown: false,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useRewardStore),
        participantBalance() {
            const participant = this.accountStore.participants.find((p) => p.sub === this.accountStore.account?.sub);
            if (!participant) return 0;
            return participant.balance;
        },
        isInsufficientPoints() {
            return this.participantBalance < this.reward.pointPrice;
        },
        isDisabled() {
            return this.isLoading || this.isInsufficientPoints || (this.isWalletRequired && !this.wallet);
        },
        isAlertDangerShown() {
            return !!this.error;
        },
        isWalletRequired() {
            return [RewardVariant.Coin, RewardVariant.NFT, RewardVariant.Galachain].includes(this.reward.variant);
        },
    },
    watch: {
        show(value) {
            this.isModalShown = value;
        },
    },
    methods: {
        onShow() {
            this.isAlertSuccessShown = false;
            this.isLoading = false;
            this.error = '';
        },
        async onSubmit() {
            this.isLoading = true;

            try {
                const walletStore = useWalletStore();

                await this.rewardStore.createPayment(this.reward.variant, this.reward._id, this.wallet);

                walletStore.list();
                this.isAlertSuccessShown = true;
            } catch (res) {
                console.error(res);
                const { error } = res as { error: { message: string } };
                this.error = error ? error.message : 'An error occurred. Please try again.';
            } finally {
                this.isLoading = false;
            }
        },
        async onClickContinue() {
            this.isModalShown = false;
            // Updates point balance
            await this.accountStore.getParticipants();
        },
    },
});
</script>

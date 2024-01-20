<template>
    <BaseCardReward
        :isDisabled="reward.isDisabled"
        :isPromoted="reward.isPromoted"
        :image="reward.image"
        :title="reward.title"
        :description="reward.description"
        :point-price="reward.pointPrice"
        :progress="reward.progress"
        :expiry="reward.expiry"
        :isLocked="reward.isLocked"
        :tokenGatingContractAddress="reward.tokenGatingContractAddress"
        @submit="onClickRedeem"
    >
        <template #title>
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-accent fw-bold">{{ reward.amount }} {{ reward.erc20.symbol }}</div>
        </template>
    </BaseCardReward>
    <BaseModalRewardPayment
        :id="`${id}${reward.uuid}`"
        :reward="reward"
        :error="error"
        :show="isModalShown"
        :is-loading="isSubmitting"
        @hidden="onModalHidden"
        @submit-redemption="onSubmitRedemption"
    />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useRewardStore } from '../../stores/Reward';
import { useWalletStore } from '../../stores/Wallet';
import { useAuthStore } from '../../stores/Auth';

export default defineComponent({
    name: 'BaseCardRewardCoin',
    data() {
        return {
            id: 'modalERC20rewardPayment',
            error: '',
            isSubmitting: false,
            isModalShown: false,
        };
    },
    props: {
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
    },
    computed: {
        ...mapStores(useRewardStore),
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
    },
    methods: {
        onModalHidden() {
            this.isModalShown = false;
            this.error = '';
        },
        onClickRedeem() {
            if (!this.authStore.oAuthShare) {
                this.accountStore.signin();
            } else {
                this.isModalShown = true;
            }
        },
        onSubmitRedemption() {
            this.isSubmitting = true;
            this.rewardStore
                .createERC20Redemption(this.reward.uuid)
                .then(async () => {
                    const walletStore = useWalletStore();
                    await this.accountStore.getBalance();
                    walletStore.list();
                    this.isModalShown = false;
                })
                .catch(({ error }) => {
                    this.error = error && error.message;
                })
                .finally(() => {
                    this.isSubmitting = false;
                });
        },
    },
});
</script>

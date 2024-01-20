<template>
    <BaseCardReward
        :isDisabled="reward.isDisabled"
        :isPromoted="reward.isPromoted"
        :image="imgUrl"
        :title="reward.title"
        :description="reward.description"
        :price="reward.price"
        :price-currency="reward.priceCurrency"
        :point-price="reward.pointPrice"
        :progress="reward.progress"
        :expiry="reward.expiry"
        :isLocked="reward.isLocked"
        :tokenGatingContractAddress="reward.tokenGatingContractAddress"
        @submit="onClickRedeem"
    >
        <template #title>
            <div class="flex-grow-1">{{ reward.title }}</div>
        </template>
    </BaseCardReward>
    <BaseModalRewardPayment
        :id="`${id}${reward.uuid}`"
        :show="isModalShown"
        :error="error"
        :reward="reward"
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
import { format, formatDistance } from 'date-fns';

export default defineComponent({
    name: 'BaseCardRewardCustom',
    data() {
        return { format, id: 'modalCustomrewardPayment', error: '', isModalShown: false, isSubmitting: false };
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
        imgUrl() {
            return this.reward.image;
        },
        isExpired: function () {
            return this.reward.expiry.now - this.reward.expiry.date > 0;
        },
        expiryDate: function () {
            return !this.isExpired
                ? formatDistance(new Date(this.reward.expiry.date), new Date(this.reward.expiry.now), {
                      addSuffix: false,
                  })
                : 'expired';
        },
    },
    methods: {
        onModalHidden() {
            this.isModalShown = false;
            this.error = '';
        },
        onClickRedeem() {
            if (!this.authStore.oAuthShare) return this.accountStore.signin();
            this.isModalShown = true;
            return null;
        },
        onSubmitRedemption() {
            this.isSubmitting = true;
            this.rewardStore
                .createCouponRedemption(this.reward.uuid)
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

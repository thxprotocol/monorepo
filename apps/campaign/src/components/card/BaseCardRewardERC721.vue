<template>
    <BaseCardReward
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
            <div class="text-success fw-bold" v-if="reward.erc1155Amount">{{ reward.erc1155Amount }}x</div>
        </template>
    </BaseCardReward>
    <BaseModalRewardPayment
        :id="`${id}${reward.uuid}`"
        :show="isModalShown"
        :error="error"
        :reawrd="reward"
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
    name: 'BaseCardRewardNFT',
    data() {
        return { format, id: 'modalERC721rewardPayment', error: '', isModalShown: false, isSubmitting: false };
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
            return this.reward.image || (this.reward.metadata && this.reward.metadata.imageUrl);
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
            if (!this.authStore.oAuthShare) {
                return this.accountStore.signin();
            }
            this.isModalShown = true;
        },
        onSubmitRedemption() {
            this.isSubmitting = true;
            this.rewardStore
                .createERC721Redemption(this.reward.uuid)
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

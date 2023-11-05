<template>
    <BaseCardReward
        :isDisabled="perk.isDisabled"
        :isPromoted="perk.isPromoted"
        :image="imgUrl"
        :title="perk.title"
        :description="perk.description"
        :price="perk.price"
        :price-currency="perk.priceCurrency"
        :point-price="perk.pointPrice"
        :progress="perk.progress"
        :expiry="perk.expiry"
        :isLocked="perk.isLocked"
        :tokenGatingContractAddress="perk.tokenGatingContractAddress"
        @submit="onClickRedeem"
    >
        <template #title>
            <div class="flex-grow-1">{{ perk.title }}</div>
        </template>
    </BaseCardReward>
    <BaseModalRewardPayment
        :id="`${id}${perk.uuid}`"
        :show="isModalShown"
        :error="error"
        :perk="perk"
        :is-loading="isSubmitting"
        @hidden="onModalHidden"
        @submit-redemption="onSubmitRedemption"
    />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { usePerkStore } from '../stores/Perk';
import { useWalletStore } from '../stores/Wallet';
import { useAuthStore } from '../stores/Auth';
import { format, formatDistance } from 'date-fns';

export default defineComponent({
    name: 'BaseCardRewardCustom',
    data() {
        return { format, id: 'modalCustomPerkPayment', error: '', isModalShown: false, isSubmitting: false };
    },
    props: {
        perk: {
            type: Object as PropType<TPerk>,
            required: true,
        },
    },
    computed: {
        ...mapStores(usePerkStore),
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        imgUrl() {
            return this.perk.image;
        },
        isExpired: function () {
            return this.perk.expiry.now - this.perk.expiry.date > 0;
        },
        expiryDate: function () {
            return !this.isExpired
                ? formatDistance(new Date(this.perk.expiry.date), new Date(this.perk.expiry.now), {
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
        },
        onSubmitRedemption() {
            this.isSubmitting = true;
            this.perksStore
                .createCustomRedemption(this.perk.uuid)
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

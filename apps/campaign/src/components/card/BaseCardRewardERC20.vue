<template>
    <BaseCardReward
        :isDisabled="perk.isDisabled"
        :isPromoted="perk.isPromoted"
        :image="perk.image"
        :title="perk.title"
        :description="perk.description"
        :point-price="perk.pointPrice"
        :progress="perk.progress"
        :expiry="perk.expiry"
        :isLocked="perk.isLocked"
        :tokenGatingContractAddress="perk.tokenGatingContractAddress"
        @submit="onClickRedeem"
    >
        <template #title>
            <div class="flex-grow-1">{{ perk.title }}</div>
            <div class="text-accent fw-bold">{{ perk.amount }} {{ perk.erc20.symbol }}</div>
        </template>
    </BaseCardReward>
    <BaseCardRewardPayment
        :id="id"
        :perk="perk"
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
import { usePerkStore } from '../../stores/Perk';
import { useWalletStore } from '../../stores/Wallet';
import { useAuthStore } from '../../stores/Auth';

export default defineComponent({
    name: 'BaseCardRewardCoin',
    data() {
        return {
            id: 'modalERC20PerkPayment',
            error: '',
            isSubmitting: false,
            isModalShown: false,
        };
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
            this.perksStore
                .createERC20Redemption(this.perk.uuid)
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

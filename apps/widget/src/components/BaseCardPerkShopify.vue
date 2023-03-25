<template>
    <BaseCardPerk
        :isPromoted="perk.isPromoted"
        :image="perk.image"
        :title="perk.title"
        :description="perk.description"
        :price="perk.price"
        :price-currency="perk.priceCurrency"
        :point-price="perk.pointPrice"
        :progress="perk.progress"
        :expiry="perk.expiry"
        @submit="onClickRedeem"
    >
        <template #title>
            <div class="flex-grow-1">{{ perk.title }}</div>
        </template>
    </BaseCardPerk>
    <BaseModalPerkPayment
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
import { useAccountStore } from '../stores/Account';
import { usePerkStore } from '../stores/Perk';
import { useWalletStore } from '../stores/Wallet';
import BaseModalPerkPayment from './BaseModalPerkPayment.vue';
import BaseCardPerk from './BaseCardPerk.vue';

export default defineComponent({
    name: 'BaseCardPerkShopify',
    components: {
        BaseModalPerkPayment,
        BaseCardPerk,
    },
    data() {
        return {
            id: 'modalShopifyPerkRedeem',
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
    },
    methods: {
        onModalHidden() {
            this.isModalShown = false;
            this.error = '';
        },
        onClickRedeem() {
            if (!this.accountStore.isAuthenticated) {
                return this.accountStore.signin();
            }
            this.isModalShown = true;
        },
        onSubmitRedemption() {
            this.isSubmitting = true;
            this.perksStore
                .createShopifyRedemption(this.perk.uuid)
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

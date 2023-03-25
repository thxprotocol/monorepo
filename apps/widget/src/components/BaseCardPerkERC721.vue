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
            <div class="text-success fw-bold">{{ perk.erc721.symbol }}</div>
        </template>
    </BaseCardPerk>
    <BaseModalPerkPayment
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
import BaseModalPerkPayment from './BaseModalPerkPayment.vue';
import BaseCardPerk from './BaseCardPerk.vue';
import { format, formatDistance } from 'date-fns';

export default defineComponent({
    name: 'BaseCardPerkERC721',
    components: {
        BaseModalPerkPayment,
        BaseCardPerk,
    },
    data() {
        return { format, id: 'modalERC721PerkPayment', error: '', isModalShown: false, isSubmitting: false };
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
        imgUrl: function () {
            if (!this.perk.metadata) return;
            const attr = this.perk.metadata.attributes.find((attr) => attr.key === 'image');
            if (!attr) return '';
            return attr.value;
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
            if (!this.accountStore.isAuthenticated) {
                return this.accountStore.signin();
            }
            this.isModalShown = true;
        },
        onSubmitRedemption() {
            this.isSubmitting = true;
            this.perksStore
                .createERC721Redemption(this.perk.uuid)
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

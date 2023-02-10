<template>
    <b-card class="m-2" :class="{ 'card-promoted': perk.isPromoted }">
        <div class="mt-1" v-if="perk.image">
            <img :src="perk.image" width="auto" class="img-fluid w-auto rounded-2 mb-3" />
        </div>
        <b-card-title class="d-flex">
            <div class="flex-grow-1">{{ perk.title }}</div>
            <div class="text-success fw-bold">{{ perk.erc721.symbol }}</div>
        </b-card-title>
        <b-card-text> {{ perk.description }} </b-card-text>
        <b-button variant="primary" block class="w-100" :disabled="perk.isOwned" @click="onClickRedeem">
            <template v-if="perk.isOwned"> Claimed </template>
            <template v-else>
                Pay <strong>{{ perk.price }} {{ perk.priceCurrency }}</strong>
                <small> / {{ perk.pointPrice }} pts</small>
            </template>
        </b-button>
        <BaseModalPerkPayment
            :id="`${id}${perk.uuid}`"
            :show="isModalShown"
            :error="error"
            :perk="perk"
            :is-loading="isSubmitting"
            @hidden="onModalHidden"
            @submit-redemption="onSubmitRedemption"
        />
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { usePerkStore } from '../stores/Perk';
import { useWalletStore } from '../stores/Wallet';
import BaseModalPerkPayment from './BaseModalPerkPayment.vue';

export default defineComponent({
    name: 'BaseCardPerkERC721',
    components: {
        BaseModalPerkPayment,
    },
    data() {
        return { id: 'modalERC721PerkPayment', error: '', isModalShown: false, isSubmitting: false };
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
    },
    methods: {
        onModalHidden() {
            this.isModalShown = false;
            this.error = '';
        },
        onClickRedeem() {
            if (!this.accountStore.isAuthenticated) {
                return this.accountStore.api.userManager.cached.signinPopup();
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
                .catch((r) => {
                    debugger;
                    this.error = r && r.error && r.error.message;
                })
                .finally(() => {
                    this.isSubmitting = false;
                });
        },
    },
});
</script>

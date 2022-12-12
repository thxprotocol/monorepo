<template>
    <b-card class="m-2 disabled">
        <div class="position-relative mt-1">
            <b-badge class="badge-point-price py-1 px-2 rounded-2">{{ perk.pointPrice }} p.</b-badge>
            <img :src="imgUrl" width="auto" class="img-fluid w-auto rounded-2 mb-3" />
        </div>
        <b-card-title class="d-flex">
            <div class="flex-grow-1">{{ perk.title }}</div>
        </b-card-title>
        <b-card-text> {{ perk.description }} </b-card-text>
        <b-button variant="primary" block class="w-100" :disabled="perk.isOwned" @click="onClickPay">
            <template v-if="perk.isOwned"> Claimed </template>
            <template v-else>
                Redeem for <strong>{{ perk.pointPrice }} points</strong>
            </template>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { usePerkStore } from '../stores/Perk';
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'BaseCardPerkERC721',
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
            const attr = this.perk.metadata.attributes.find((attr) => attr.key === 'image');
            if (!attr) return '';
            return attr.value;
        },
    },
    methods: {
        onClickPay() {
            if (!this.accountStore.isAuthenticated) {
                return this.accountStore.api.userManager.cached.signinPopup();
            }
            this.perksStore.createPayment(this.perk.uuid).then(() => {
                const walletStore = useWalletStore();
                walletStore.list();
                this.accountStore.getBalance();
            });
        },
    },
});
</script>

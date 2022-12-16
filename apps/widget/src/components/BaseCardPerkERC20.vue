<template>
    <b-card class="m-2 disabled">
        <!-- <div class="position-relative mt-1" v-if="imgUrl">
            <b-badge class="badge-point-price py-1 px-2 rounded-2">{{ perk.pointPrice }} p.</b-badge>
            <img :src="imgUrl" width="auto" class="img-fluid w-auto rounded-2 mb-3" />
        </div> -->
        <b-card-title class="d-flex">
            <div class="flex-grow-1">{{ perk.title }}</div>
        </b-card-title>
        <b-card-text> {{ perk.description }} </b-card-text>
        <b-button variant="primary" block class="w-100" :disabled="perk.isOwned" v-b-modal="'test'">
            <template v-if="perk.isOwned"> Claimed </template>
            <template v-else>
                Redeem for <strong>{{ perk.pointPrice }} points</strong>
            </template>
        </b-button>

        <b-modal
            id="test"
            :title="perk.title"
            no-close-on-backdrop
            centered
            header-bg-variant="purple-darker"
            body-bg-variant="purple-darker"
            footer-bg-variant="purple-darker"
            header-close-white
            no-close-on-esc
        >
            <div v-if="isSubmitting" class="text-center">
                <b-spinner variant="light" show size="sm" />
            </div>
            <template v-else>
                <p>
                    You are about to redeem <strong>{{ perk.pointPrice }} points</strong> for
                    <strong>{{ perk.title }}</strong
                    >. Are you sure?
                </p>
            </template>
            <template #footer>
                <b-button variant="primary" class="w-100 rounded-pill" @click="onClickPay">
                    Redeem for {{ perk.pointPrice }} points
                </b-button>
            </template>
        </b-modal>
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
    data() {
        return {
            isSubmitting: false,
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
        onClickPay() {
            if (!this.accountStore.isAuthenticated) {
                return this.accountStore.api.userManager.cached.signinPopup();
            }
            this.isSubmitting = true;
            this.perksStore.createERC20PerkPayment(this.perk.uuid).then(() => {
                const walletStore = useWalletStore();
                walletStore.list();
                this.accountStore.getBalance();
                this.isSubmitting = false;
            });
            // this.$bvModal.hide('test');
        },
    },
});
</script>

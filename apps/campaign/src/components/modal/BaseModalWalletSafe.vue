<template>
    <b-modal :id="id" v-model="isShown" @hidden="isShown = false" centered hide-footer>
        <template #header>
            <h5 class="modal-title"><i class="fas fa-wallet me-2"></i> Wallet</h5>
            <b-link class="btn-close" @click="isShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-form>
            <BaseFormGroupWalletAddress :wallet="wallet">
                <template #description>
                    This
                    <b-link :href="`https://app.safe.global/home?safe=matic:${wallet.address}`" target="_blank">
                        Safe multisig
                    </b-link>
                    has been created for you and requires transaction signatures from both our relayer and your Web3Auth
                    wallet.
                </template>
            </BaseFormGroupWalletAddress>
        </b-form>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWallet',
    data() {
        return {
            isShown: false,
        };
    },
    props: {
        id: String,
        wallet: { type: Object, required: true },
    },
    watch: {
        show(show: boolean) {
            this.isShown = show;
        },
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore, useWalletStore),
    },
});
</script>

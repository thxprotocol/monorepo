<template>
    <b-modal :id="id" v-model="isShown" @show="onShow" @hidden="isShown = false" centered hide-footer>
        <template #header>
            <h5 class="modal-title"><i class="fas fa-wallet me-2"></i> Wallet</h5>
            <b-link class="btn-close" @click="isShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-form>
            <BaseFormGroupWalletAddress :wallet="wallet">
                <template #description> You have imported this wallet using WalletConnect. </template>
            </BaseFormGroupWalletAddress>
        </b-form>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWallet',
    data() {
        return {
            isShown: false,
            error: '',
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
        ...mapStores(useAccountStore, useWalletStore),
    },
    methods: {
        async onShow() {
            // Show signers
        },
    },
});
</script>

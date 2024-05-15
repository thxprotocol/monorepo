<template>
    <b-modal :id="id" v-model="isShown" centered hide-footer @show="onShow" @hidden="isShown = false">
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
    props: {
        id: String,
        wallet: { type: Object, required: true },
    },
    data() {
        return {
            isShown: false,
            error: '',
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
    },
    watch: {
        show(show: boolean) {
            this.isShown = show;
        },
    },
    methods: {
        async onShow() {
            // Show signers
        },
    },
});
</script>

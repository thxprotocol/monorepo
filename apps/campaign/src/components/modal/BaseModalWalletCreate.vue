<template>
    <b-modal
        v-model="walletStore.isModalWalletCreateShown"
        centered
        hide-footer
        @show="onShow"
        @hidden="walletStore.isModalWalletCreateShown = false"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-wallet me-2"></i> Add a new wallet</h5>
            <b-link class="btn-close" @click="walletStore.isModalWalletCreateShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>

        <b-tabs v-model="tabIndex" pills justified content-class="pt-3">
            <b-tab title="1. Choose">
                <BaseTabWalletVariant :variant="variant" @change="variant = $event" @next="tabIndex = 1" />
            </b-tab>
            <b-tab title="2. Settings" :disabled="!variant">
                <BaseTabWalletWalletConnect
                    v-if="variant === WalletVariant.WalletConnect"
                    @close="walletStore.isModalWalletCreateShown = false"
                />
                <BaseTabWalletWeb3Auth
                    v-if="variant === WalletVariant.Safe"
                    @close="walletStore.isModalWalletCreateShown = false"
                />
            </b-tab>
        </b-tabs>
    </b-modal>
</template>

<script lang="ts">
import { WalletVariant } from '../../types/enums/accountVariant';
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWalletCreate',
    data() {
        return {
            tabIndex: 0,
            WalletVariant,
            isLoading: false,
            variant: '' as WalletVariant,
            message: '',
            signature: '',
        };
    },
    computed: {
        ...mapStores(useWalletStore),
    },
    methods: {
        onShow() {
            this.variant = '' as WalletVariant;
            this.tabIndex = 0;
        },
    },
});
</script>

<template>
    <b-form-group>
        <b-button
            :disabled="isDisabledSafeCreate"
            :variant="variant === WalletVariant.Safe ? 'primary' : 'outline-primary'"
            class="rounded mb-2 w-100 text-white justify-content-start"
            @click="$emit('change', WalletVariant.Safe)"
        >
            <div class="d-flex align-items-center">
                <b-img :src="walletLogoMap[WalletVariant.Safe]" width="17" class="me-2 rounded" />
                Safe Multisig
            </div>
            <p class="small text-start text-opaque mb-0">Create a Safe multisig. We sponsor the gas costs!</p>
        </b-button>
        <b-button
            :variant="variant === WalletVariant.WalletConnect ? 'primary' : 'outline-primary'"
            class="rounded mb-2 w-100 text-white"
            @click="$emit('change', WalletVariant.WalletConnect)"
        >
            <div class="d-flex align-items-center">
                <b-img :src="walletLogoMap[WalletVariant.WalletConnect]" width="17" class="me-2 rounded" />
                Your Wallet
            </div>
            <p class="small text-start text-opaque mb-0">Connect one of your wallets using WalletConnect.</p>
        </b-button>
    </b-form-group>
    <b-button @click="$emit('next')" :disabled="isDisabled" variant="primary" class="w-100">Continue</b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { WalletVariant } from '../../types/enums/accountVariant';

export default defineComponent({
    name: 'BaseTabWalletVariant',
    data() {
        return {
            walletLogoMap,
            WalletVariant,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
        isDisabled() {
            return !this.variant;
        },
        isDisabledSafeCreate() {
            return !!this.walletStore.wallets.find((wallet) => wallet.variant === WalletVariant.Safe);
        },
    },
    props: {
        variant: { type: String, required: false },
    },
});
</script>

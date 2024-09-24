<template>
    <b-form-group>
        <b-button
            :variant="variant === WalletVariant.WalletConnect ? 'primary' : 'outline-primary'"
            class="rounded mb-2 w-100 text-white"
            @click="$emit('change', WalletVariant.WalletConnect)"
        >
            <div class="d-flex align-items-center">
                <b-img :src="walletLogoMap[WalletVariant.WalletConnect]" width="17" class="me-2 rounded" />
                Your Wallet
            </div>
            <p class="small text-start text-opaque mb-0">Connect one of your existing wallets using WalletConnect.</p>
        </b-button>
        <b-button
            :variant="variant === WalletVariant.Safe ? 'primary' : 'outline-primary'"
            class="rounded mb-2 w-100 text-white justify-content-start"
            @click="$emit('change', WalletVariant.Safe)"
        >
            <div class="d-flex align-items-center">
                <b-img :src="walletLogoMap[WalletVariant.Safe]" width="17" class="me-2 rounded" />
                Safe Multisig
            </div>
            <p class="small text-start text-opaque mb-0">
                Create a free Safe multisig. We sponsor your transaction costs!
            </p>
        </b-button>
    </b-form-group>
    <b-button :disabled="isDisabled" variant="primary" class="w-100" @click="$emit('next')"> Continue </b-button>
</template>

<script lang="ts">
import { WalletVariant } from '@thxnetwork/common/enums';
import { useAccountStore, useAuthStore, useWalletStore } from '@thxnetwork/wallet/stores';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import imgSafeLogo from '../assets/safe-logo.jpg';
import imgWalletConnectLogo from '../assets/walletconnect-logo.png';

export default defineComponent({
    name: 'BaseTabWalletVariant',
    props: {
        variant: { type: String, required: false },
    },
    data() {
        return {
            walletLogoMap: {
                [WalletVariant.WalletConnect]: imgWalletConnectLogo,
                [WalletVariant.Safe]: imgSafeLogo,
            },
            WalletVariant,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
        isDisabled() {
            return !this.variant;
        },
    },
});
</script>

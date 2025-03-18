<template>
    <b-form-group>
        <b-button
            :variant="variant === WalletVariant.WalletConnect ? 'primary' : 'outline-primary'"
            class="rounded mb-2 w-100 wallet-hover-btn px-3"
            @click="$emit('change', WalletVariant.WalletConnect)"
        >
            <div class="d-flex align-items-center">
                <b-img
                    :src="
                        walletStore.currentChainId == ChainId.Aptos
                            ? imgSantaWalletLogo
                            : walletLogoMap[WalletVariant.WalletConnect]
                    "
                    width="17"
                    class="me-2 rounded"
                />
                Your Wallet
            </div>
            <p class="small text-start mb-0">
                Connect one of your existing wallets using
                {{ walletStore.currentChainId == ChainId.Aptos ? 'Santa Wallet' : 'WalletConnect' }}.
            </p>
            <!-- <p v-if="isMobile" class="small text-start mb-0 mt-1 text-warning">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                You’ll be redirected to the OKX app or prompted to download the OKX Wallet app.
            </p> -->
        </b-button>
        <b-button
            v-if="accountStore.config.isQRCodeCampaign"
            :disabled="isDisabledSafeCreate"
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
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { WalletVariant } from '../../types/enums/accountVariant';
import { ChainId } from '@thxnetwork/common/enums';
import imgSantaWalletLogo from '../../assets/wallet.png';

export default defineComponent({
    name: 'BaseTabWalletVariant',
    props: {
        variant: { type: String, required: false },
    },
    data() {
        return {
            walletLogoMap,
            WalletVariant,
            ChainId,
            imgSantaWalletLogo,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
        isDisabled() {
            return !this.variant;
        },
        // Can not create Safes if not for a QR code campaign and if a Safe for the required network already exists
        isDisabledSafeCreate() {
            return false;
            // return !!this.walletStore.wallets.find((wallet) => wallet.variant === WalletVariant.Safe);
        },
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
    },
});
</script>
<style>
.wallet-hover-btn:hover {
    background: var(--btn-primary-santa) !important;
    border-color: transparent !important;
}
</style>

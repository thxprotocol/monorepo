<template>
    <b-dropdown v-if="walletStore.wallets.length" variant="primary" no-caret center>
        <template v-if="walletStore.wallet" #button-content>
            {{ walletStore.wallet.short }}
            <BaseIcon icon="caret-down" class="ms-2" />
        </template>
        <template v-else #button-content> No wallet selected </template>
        <b-dropdown-item v-for="w of walletStore.wallets" @click="walletStore.set(w)">
            <code class="text-white">{{ w.short }}</code>
            <b-link
                v-if="w.variant === WalletVariant.Safe"
                v-b-modal="`modalWalletSafe${w._id}`"
                class="text-white text-opaque ms-3"
            >
                <BaseIcon icon="cog" />
            </b-link>
            <BaseModalWalletSafe :id="`modalWalletSafe${w._id}`" :wallet="w" />
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item @click="walletStore.isModalWalletCreateShown = true"> Connect Wallet </b-dropdown-item>
    </b-dropdown>
    <b-button v-else variant="primary" @click="walletStore.isModalWalletCreateShown = true"> Connect Wallet </b-button>
</template>

<script lang="ts">
import { WalletVariant } from '@thxnetwork/common/enums';
import { useWalletStore, useWeb3AuthStore } from '@thxnetwork/wallet/stores';
import { mapStores } from 'pinia';

export default {
    name: 'BaseDropdownWallets',
    data() {
        return {
            WalletVariant,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useWeb3AuthStore),
    },
};
</script>

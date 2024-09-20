<template>
    <b-dropdown v-if="walletStore.wallets.length" variant="primary" no-caret center>
        <template v-if="walletStore.wallet" #button-content>
            {{ walletStore.wallet.short }}
            <BaseIcon icon="caret-down" class="ms-2" />
        </template>
        <b-dropdown-item v-for="w of walletStore.wallets" @click="walletStore.wallet = w">
            <code class="text-white">{{ w.short }}</code>
            <span v-if="w.chainId" class="ms-2"> ({{ w.chainId }}) </span>
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item @click="walletStore.isModalWalletShown = true"> Connect Wallet </b-dropdown-item>
    </b-dropdown>
    <b-button v-else variant="primary" @click="walletStore.isModalWalletShown = true"> Connect Wallet </b-button>
    <BaseModalWallet />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { useWalletStore } from '@thxnetwork/wallet/stores';

export default {
    name: 'BaseDropdownWallets',
    computed: {
        ...mapStores(useWalletStore),
    },
};
</script>

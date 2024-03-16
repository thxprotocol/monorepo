<template>
    <b-dropdown
        v-model="isOpen"
        class="w-100"
        menu-class="w-100"
        toggle-class="rounded d-flex align-items-center justify-content-between"
        variant="link-white"
        no-caret
    >
        <template #button-content>
            <div v-if="walletStore.wallet" class="d-flex align-items-center me-2">
                <b-img
                    :src="walletLogoMap[walletStore.wallet.variant]"
                    width="15"
                    height="15"
                    style="border-radius: 3px"
                    class="me-2"
                />
                {{ walletStore.wallet.short }}
            </div>
            <div v-else>Select your wallet</div>
            <i
                v-if="isWalletConnect"
                class="fas fa-check-circle text-opaque me-auto"
                :class="{ 'text-success': isConnected, 'text-danger': !isConnected }"
            ></i>
            <i class="fas fa-caret-down ms-3"></i>
        </template>
        <b-dropdown-item
            v-for="wallet of walletStore.wallets"
            link-class="d-flex align-items-center justify-content-between pe-1"
            @click="onClickWallet(wallet)"
        >
            <div class="d-flex align-items-center">
                <b-img
                    :src="walletLogoMap[wallet.variant]"
                    width="15"
                    height="15"
                    style="border-radius: 3px"
                    class="me-2"
                />
                {{ wallet.short }}
            </div>
            <b-button v-b-modal.stop="`modalWallet${wallet._id}`" size="sm" variant="link">
                <i class="fas fa-cog text-white text-opaque" />
            </b-button>
            <component :is="getComponentName(wallet)" :id="`modalWallet${wallet._id}`" :wallet="wallet" size="lg" />
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item link-class="d-flex align-items-center" @click="walletStore.isModalWalletCreateShown = true">
            New Wallet
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { WalletVariant } from '../../types/enums/accountVariant';

export default defineComponent({
    name: 'BaseDropdownWallets',
    data() {
        return {
            walletLogoMap,
            isOpen: false,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useAccountStore),
        isWalletConnect() {
            return this.walletStore.wallet?.variant === WalletVariant.WalletConnect;
        },
        isConnected() {
            const { chainId, account, wallet } = this.walletStore;
            if (!account) return false;

            const isAddressCorrect = account.address === wallet.address;
            const isChainCorrect = chainId === wallet.chainId;

            return isAddressCorrect && isChainCorrect;
        },
    },
    watch: {
        'accountStore.account': {
            async handler(account) {
                if (!account) return;
                await this.walletStore.listWallets();

                // Check if there a preferred wallet in global config
                this.setActiveWallet();

                // If no preferred wallet is set pick the safe multisig
                // and a walletconnect one otherwise
                if (!this.walletStore.wallet) {
                    this.setDefaultWallet();
                }

                this.listRewards();
            },
            immediate: true,
        },
    },
    methods: {
        setActiveWallet() {
            const { activeWalletId } = this.accountStore.globals();
            if (activeWalletId) {
                const wallet = this.walletStore.wallets.find((wallet) => wallet._id === activeWalletId) || null;
                this.walletStore.setWallet(wallet);
            }
        },
        setDefaultWallet() {
            const wallet =
                this.walletStore.wallets.find(
                    (wallet) => wallet.variant === WalletVariant.Safe || wallet.variant === WalletVariant.WalletConnect,
                ) || null;
            this.walletStore.setWallet(wallet);
        },
        listRewards() {
            this.walletStore.list();
        },
        onClickWallet(wallet: TWallet) {
            this.walletStore.setWallet(wallet);
            this.accountStore.setGlobals({ activeWalletId: wallet._id });
            this.listRewards();
        },
        getComponentName(wallet: TWallet) {
            const map: { [variant: string]: string } = {
                [WalletVariant.WalletConnect]: 'BaseModalWallet',
                [WalletVariant.Safe]: 'BaseModalWalletSafe',
            };
            return map[wallet.variant];
        },
    },
});
</script>
<style>
.dropdown-toggle .fa-ellipsis-v {
    color: var(--bs-body-color);
}
</style>

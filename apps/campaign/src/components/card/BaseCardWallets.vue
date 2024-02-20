<template>
    <div class="d-flex px-3 pb-3">
        <b-dropdown
            class="w-100"
            menu-class="w-100"
            toggle-class="rounded d-flex align-items-center justify-content-between"
            v-model="isOpen"
            variant="outline-primary"
            no-caret
        >
            <template #button-content>
                <div class="d-flex align-items-center" v-if="walletStore.wallet">
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
                <i class="fas fa-ellipsis-v ms-auto" />
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
                <b-button v-b-modal="`modalWallet${wallet._id}`" size="sm" variant="link">
                    <i class="fas fa-cog text-white text-opaque" />
                </b-button>
                <component :is="getComponentName(wallet)" :id="`modalWallet${wallet._id}`" :wallet="wallet" size="lg" />
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item
                @click="walletStore.isModalWalletCreateShown = true"
                link-class="d-flex align-items-center"
            >
                New Wallet
            </b-dropdown-item>
            <BaseModalWalletCreate size="lg" />
        </b-dropdown>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { WalletVariant } from '../../types/enums/accountVariant';
import BaseModalWallet from '../modal/BaseModalWallet.vue';
import BaseModalWalletSafe from '../modal/BaseModalWalletSafe.vue';
import BaseModalWalletWeb3Auth from '../modal/BaseModalWalletWeb3Auth.vue';

export default defineComponent({
    name: 'BaseViewCampaignWallets',
    components: {
        BaseModalWallet,
        BaseModalWalletSafe,
        BaseModalWalletWeb3Auth,
    },
    data(): { isOpen: boolean; walletLogoMap: any } {
        return {
            walletLogoMap,
            isOpen: false,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useAccountStore),
    },
    watch: {
        'accountStore.account': {
            async handler(account: TAccount | null) {
                if (!account) return;

                // List all wallets for the account
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
                const wallet = this.walletStore.wallets.find((wallet) => wallet._id === activeWalletId);
                this.walletStore.wallet = wallet || null;
            }
        },
        setDefaultWallet() {
            const wallet = this.walletStore.wallets.find(
                (wallet) => wallet.variant === WalletVariant.Safe || wallet.variant === WalletVariant.WalletConnect,
            );
            this.walletStore.wallet = wallet || null;
        },
        listRewards() {
            this.walletStore.list();
        },
        onClickWallet(wallet: TWallet) {
            this.walletStore.wallet = wallet;
            this.accountStore.setGlobals({ activeWalletId: wallet._id });
            this.listRewards();
        },
        getComponentName(wallet: TWallet) {
            const map: { [variant: string]: string } = {
                [WalletVariant.WalletConnect]: 'BaseModalWallet',
                [WalletVariant.Safe]: 'BaseModalWalletSafe',
                [WalletVariant.Web3Auth]: 'BaseModalWalletWeb3Auth',
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

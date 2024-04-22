<template>
    <div class="d-flex" style="height: 30px">
        <b-dropdown
            v-model="isOpenWallet"
            variant="link"
            class="w-100"
            toggle-class="d-flex align-items-center justify-content-end text-white text-decoration-none pe-0"
            auto-close="outside"
            menu-class="bg-body"
            no-caret
            end
        >
            <template #button-content>
                <i
                    :class="{
                        'text-success': isConnected || !isWalletConnect,
                        'text-danger': !isConnected && isWalletConnect,
                    }"
                    class="fas fa-circle me-2"
                />
                <div>{{ walletStore.wallet ? walletStore.wallet.short : 'No Wallet' }}</div>
            </template>
            <b-dropdown-text v-if="walletStore.wallet" text-class="bg-dark">
                <b-form-group label-class="d-flex align-items-center mb-1 ">
                    <template #label>
                        <span class="text-opaque">Account</span>
                        <template v-if="isWalletConnect">
                            <b-button
                                v-if="isConnected"
                                size="sm"
                                variant="primary"
                                class="ms-auto"
                                @click="onClickDisconnect"
                            >
                                Disconnect
                            </b-button>
                            <b-button v-else size="sm" variant="primary" class="ms-auto" @click="onClickConnect">
                                Connect
                            </b-button>
                        </template>
                        <template v-else>
                            <b-button
                                v-b-modal="`modalWallet${walletStore.wallet._id}`"
                                size="sm"
                                variant="primary"
                                class="ms-auto"
                            >
                                Settings
                            </b-button>
                            <BaseModalWalletSafe
                                :id="`modalWallet${walletStore.wallet._id}`"
                                :wallet="walletStore.wallet"
                                size="lg"
                            />
                        </template>
                    </template>
                    <div class="d-flex align-items-center">
                        <b-avatar badge-variant="light" :src="walletImgURL" size="2.8rem" class="me-2">
                            <template #badge>
                                <b-img :src="chainList[walletStore.wallet.chainId].logo" width="12" height="12" />
                            </template>
                        </b-avatar>
                        <div>
                            <div class="d-flex align-items-center">
                                <strong class="me-5">
                                    {{ walletStore.wallet.short }}
                                </strong>
                                <b-button
                                    v-clipboard:copy="walletStore.wallet?.address"
                                    v-clipboard:success="() => (isCopied = true)"
                                    variant="primary"
                                    size="sm"
                                    class="ms-2 px-2 p-1"
                                >
                                    <i
                                        class="fas fa-clipboard"
                                        :class="{ 'fa-clipboard-check': isCopied, 'fa-clipboard': !isCopied }"
                                        style="font-size: 0.7rem"
                                    />
                                </b-button>
                                <b-button
                                    variant="primary"
                                    size="sm"
                                    class="ms-2 px-2 p-1"
                                    :href="
                                        chainList[walletStore.wallet.chainId].blockExplorer +
                                        '/address/' +
                                        walletStore.wallet?.address
                                    "
                                    target="_blank"
                                >
                                    <i class="fas fa-external-link-alt" style="font-size: 0.7rem" />
                                </b-button>
                            </div>
                            <div v-if="walletStore.wallet" class="d-flex align-items-center me-2">
                                {{ walletVariantMap[walletStore.wallet.variant] }}
                                <b-img
                                    :src="walletLogoMap[walletStore.wallet.variant]"
                                    width="15"
                                    height="15"
                                    style="border-radius: 3px"
                                    class="ms-1"
                                />
                            </div>
                        </div>
                    </div>
                </b-form-group>
                <b-form-group label="Network" label-class="text-opaque">
                    <i
                        v-if="isWalletConnect"
                        class="fas fa-circle me-2"
                        :class="{ 'text-success': isConnected, 'text-danger': !isConnected }"
                    />
                    {{ chainList[walletStore.wallet.chainId].name }}
                    <span class="text-opaque">({{ walletStore.wallet.chainId }})</span>
                </b-form-group>
            </b-dropdown-text>
        </b-dropdown>
        <b-dropdown v-model="isOpen" variant="link" menu-class="w-100" no-caret end toggle-class="py-0">
            <template #button-content>
                <i class="fas fa-caret-down text-white" />
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
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item
                link-class="d-flex align-items-center"
                @click="walletStore.isModalWalletCreateShown = true"
            >
                New Wallet
            </b-dropdown-item>
        </b-dropdown>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { WalletVariant } from '../../types/enums/accountVariant';
import { chainList } from '@thxnetwork/campaign/utils/chains';

export default defineComponent({
    name: 'BaseDropdownWallets',
    props: {
        toggleClass: String,
    },
    data() {
        return {
            walletLogoMap,
            chainList,
            isCopied: false,
            isOpen: false,
            isOpenWallet: false,
            walletVariantMap: {
                [WalletVariant.WalletConnect]: 'Wallet Connect',
                [WalletVariant.Safe]: 'Safe Multisig',
            } as Record<string, string>,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useAccountStore),
        isWalletConnect() {
            return this.walletStore.wallet?.variant === WalletVariant.WalletConnect;
        },
        isConnected() {
            const { chainId, account, wallet } = this.walletStore;
            if (!account || !wallet) return false;

            const isAddressCorrect = account.address === wallet.address;
            const isChainCorrect = chainId === wallet.chainId;

            return isAddressCorrect && isChainCorrect;
        },
        walletImgURL() {
            if (!this.walletStore.wallet) return '';

            const url = new URL('https://api.dicebear.com/8.x/identicon/svg');
            url.searchParams.append('seed', this.walletStore.wallet.address);
            url.searchParams.append('backgroundType', 'gradientLinear');
            return url.toString();
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
        onClickConnect() {
            this.walletStore.connect();
        },
        onClickDisconnect() {
            this.walletStore.disconnect();
        },
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
        async onClickWallet(wallet: TWallet) {
            this.walletStore.setWallet(wallet);
            this.accountStore.setGlobals({ activeWalletId: wallet._id });
            this.listRewards();
        },
    },
});
</script>
<style>
.dropdown-toggle .fa-ellipsis-v {
    color: var(--bs-body-color);
}
</style>

<template>
    <div v-if="accountStore.isAuthenticated" class="d-flex">
        <b-dropdown
            v-model="isOpenChains"
            variant="link"
            class="w-100 rounded"
            :style="{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderTopRightRadius: walletStore.wallets.length ? '0 !important' : null,
                borderBottomRightRadius: walletStore.wallets.length ? '0 !important' : null,
            }"
            toggle-class="d-flex align-items-center justify-content-end text-white text-decoration-none p-2 ps-3 pe-0"
            auto-close="outside"
            menu-class="bg-body"
            no-caret
            start
        >
            <template #button-content>
                <b-img
                    v-if="walletStore.chainId"
                    :src="chainList[walletStore.chainId].logo"
                    width="15"
                    height="15"
                    class="me-2"
                />
                <b-spinner v-else small />
            </template>
            <b-dropdown-item
                v-for="chain of chains"
                link-class="d-flex align-items-center"
                @click="onClickChainSwitch(chain)"
            >
                <b-img :src="chainList[chain.chainId].logo" width="15" height="15" class="me-3" />
                {{ chain.name }}
            </b-dropdown-item>
        </b-dropdown>
        <b-dropdown
            v-model="isOpenWallet"
            variant="link"
            class="w-100 rounded"
            :style="{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderTopLeftRadius: '0 !important',
                borderBottomLeftRadius: '0 !important',
                borderTopRightRadius: walletStore.wallets.length ? '0 !important' : null,
                borderBottomRightRadius: walletStore.wallets.length ? '0 !important' : null,
            }"
            :toggle-class="`d-flex align-items-center justify-content-end text-white text-decoration-none py-2 px-1 ${
                !walletStore.wallets.length ? 'pe-3' : ''
            }`"
            auto-close="outside"
            menu-class="bg-body"
            no-caret
            center
        >
            <template v-if="walletStore.wallet" #button-content>
                {{ walletStore.wallet.short }}
            </template>
            <template v-else #button-content> Connect </template>
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
                        <i
                            class="fas fa-circle me-2"
                            :class="{ 'text-success': isConnected, 'text-danger': !isConnected }"
                        />
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
                                chainList[walletStore.chainId].blockExplorer + '/address/' + walletStore.wallet?.address
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
                </b-form-group>
            </b-dropdown-text>
            <b-dropdown-item
                v-else
                link-class="d-flex align-items-center"
                @click="walletStore.isModalWalletCreateShown = true"
            >
                Add Wallet
            </b-dropdown-item>
        </b-dropdown>
        <b-dropdown
            v-if="walletStore.wallets.length"
            v-model="isOpen"
            variant="link"
            menu-class="w-100 bg-body"
            no-caret
            end
            toggle-class="p-2"
            :disabled="!accountStore.isAuthenticated"
            :style="{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderTopLeftRadius: '0 !important',
                borderBottomLeftRadius: '0 !important',
            }"
        >
            <template #button-content>
                <i class="fas fa-caret-down text-white me-2" />
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
                Add Wallet
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
import { chainList } from '@thxnetwork/app/utils/chains';
import { ChainId } from '@thxnetwork/common/enums';
import { PROD } from '@thxnetwork/app/config/secrets';

export default defineComponent({
    name: 'BaseDropdownWallets',
    props: {
        toggleClass: String,
    },
    data() {
        return {
            ChainId,
            walletLogoMap,
            chainList,
            isCopied: false,
            isOpen: false,
            isOpenWallet: false,
            isOpenChains: false,
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
            const { account, wallet } = this.walletStore;
            if (!account || !wallet) return false;
            return account.address === wallet.address;
        },
        walletImgURL() {
            if (!this.walletStore.wallet) return '';

            const url = new URL('https://api.dicebear.com/8.x/identicon/svg');
            url.searchParams.append('seed', this.walletStore.wallet.address);
            url.searchParams.append('backgroundType', 'gradientLinear');
            return url.toString();
        },
        chains() {
            const allowedChains = [ChainId.Polygon, ChainId.Linea, ...(PROD ? [] : [ChainId.Hardhat])];
            return Object.values(chainList).filter(({ chainId }) => allowedChains.includes(chainId));
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
                this.walletStore.list();
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
        async onClickWallet(wallet: TWallet) {
            this.walletStore.setWallet(wallet);
            this.accountStore.setGlobals({ activeWalletId: wallet._id });
            this.walletStore.list();
        },
        onClickChainSwitch(chain: { chainId: ChainId }) {
            this.walletStore.switchChain(chain.chainId);
        },
    },
});
</script>
<style>
.dropdown-toggle .fa-ellipsis-v {
    color: var(--bs-body-color);
}
</style>

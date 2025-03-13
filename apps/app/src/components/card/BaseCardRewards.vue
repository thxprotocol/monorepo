<template>
    <div class="wallet-wrap h-100 d-flex flex-column">
        <!-- <BaseNavbarSecondary v-if="accountStore.isMobile" class="ms-auto" /> -->

        <div class="d-flex p-2 m-0 align-items-center">
            <div class="flex-grow-1 pe-2 d-flex quest-group-title align-items-center">
                Wallet
                <span class="reward-info-wrap ms-1">
                    <i class="fas fa-info-circle fs-6" style="opacity: 0.35"></i>
                    <span class="tooltip-text"
                        >Securely holds your web3 earnings and allows for easy transactions.</span
                    >
                </span>
                <!-- <b-spinner v-if="walletStore.isLoading" class="ms-2" variant="primary" small /> -->
            </div>
            <!-- <b-dropdown variant="primary" size="sm" no-caret>
                <template #button-content>
                    {{ activeFilter.label }}
                    <i class="fas fa-caret-down ms-1" />
                </template>
                <b-dropdown-item-button v-for="filter of filters" @click="activeFilter = filter">
                    {{ filter.label }}
                </b-dropdown-item-button>
            </b-dropdown> -->
        </div>
        <div v-if="accountStore.isAuthenticated" class="d-flex overflow-auto flex-grow-1">
            <div v-if="walletStore.isLoading" class="spinner-container">
                <b-spinner variant="primary" small />
            </div>
            <div v-else class="d-flex w-100">
                <div class="d-flex flex-column wallet-info">
                    <div class="d-flex justify-content-between wallet-box align-items-baseline">
                        <div v-if="walletStore.wallet" class="d-flex align-items-center">
                            <img
                                :src="onlineEllipse"
                                alt="online"
                                width="10"
                                height="10"
                                style="filter: drop-shadow(0px 2px 7px rgba(187, 255, 175, 0.3))"
                                class="wallet-online"
                            />
                            <div class="wallet-online-word">
                                {{ walletStore.wallet.short }}
                            </div>
                        </div>
                        <div v-else>
                            <div class="wallet-online-word">Connect Wallet</div>
                        </div>
                        <button class="new-wallet-btn" @click="walletStore.isModalChainSelectShown = true">
                            + New Wallet
                        </button>
                    </div>
                    <div class="d-flex gap-3 wallet-boxes">
                        <div class="d-flex flex-column wallet-connected w-100">
                            <div v-if="walletStore.wallets.length" class="wallet-text">Connected Wallets</div>
                            <div v-if="walletStore.wallets.length" class="d-flex flex-column gap-4 address-list">
                                <div
                                    v-for="wallet of walletStore.wallets"
                                    class="d-flex align-items-center wallet-online-word justify-content-between"
                                >
                                    <div
                                        :class="{
                                            'cursor-pointer': wallet._id !== walletStore.wallet?._id,
                                            'selected-wallet': wallet._id === walletStore.wallet?._id,
                                        }"
                                        @click="wallet._id !== walletStore.wallet?._id ? onClickWallet(wallet) : null"
                                    >
                                        <b-img
                                            :src="walletLogoMap[wallet.variant]"
                                            width="15"
                                            height="15"
                                            style="border-radius: 3px"
                                            class="me-2"
                                        />
                                        {{ wallet.short }}
                                    </div>

                                    <div class="d-flex gap-2">
                                        <div
                                            v-clipboard:copy="wallet?.address"
                                            v-clipboard:success="() => (isCopied = true)"
                                            class="cursor-pointer"
                                        >
                                            <img
                                                :src="copyIcon"
                                                alt="copy"
                                                height="18"
                                                width="18"
                                                class="icon-shadow"
                                            />
                                        </div>
                                        <a
                                            :href="
                                                'https://explorer.aptoslabs.com/account/' +
                                                wallet?.address +
                                                '?network=mainnet'
                                            "
                                            target="_blank"
                                            class="cursor-pointer"
                                        >
                                            <img
                                                :src="shareIcon"
                                                alt="share"
                                                height="18"
                                                width="18"
                                                class="icon-shadow"
                                            />
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="position-absolute top-50 start-50 translate-middle opacity-50">
                                No Wallet Connected!
                            </div>
                        </div>

                        <div
                            class="d-flex flex-column wallet-connected w-100"
                            :class="{ 'd-none': !walletStore.wallets.length }"
                            style="max-height: 245px"
                        >
                            <div class="d-flex justify-content-between px-2 wallet-text">
                                <span class="selected-wallet">{{ walletStore?.wallet?.short }}</span>
                                <div class="d-flex gap-2">
                                    <div
                                        v-clipboard:copy="walletStore.wallet?.address"
                                        v-clipboard:success="() => (isCopied = true)"
                                        class="cursor-pointer"
                                    >
                                        <img :src="copyIcon" alt="copy" height="18" width="18" class="icon-shadow" />
                                    </div>
                                    <!-- https://explorer.aptoslabs.com/account/0x15aa2e621f592264e1b726374fd3c5a41a9927f1332c14cdb2b47c95e339ba10?network=mainnet 1st one -->
                                    <a
                                        :href="
                                            'https://explorer.aptoslabs.com/account/' +
                                            walletStore.wallet?.address +
                                            '?network=mainnet'
                                        "
                                        target="_blank"
                                        class="cursor-pointer"
                                    >
                                        <img :src="shareIcon" alt="share" height="18" width="18" class="icon-shadow" />
                                    </a>
                                </div>
                            </div>

                            <div class="d-flex h-100 w-100 align-items-center justify-content-center">
                                <div class="d-flex justify-content-around w-100">
                                    <div
                                        v-for="token in twoTokens"
                                        :key="token._id"
                                        class="d-flex flex-column align-items-center token-display"
                                    >
                                        <div class="token-balance">{{ token.walletBalance || 0 }}</div>
                                        <div class="token-symbol">{{ token.erc20.symbol }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div v-for="(token, key) of list" :key="key" class="mb-1">
            <component :is="token.component" :token="token" />
        </div> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAuthStore } from '../../stores/Auth';
import { RewardVariant } from '@thxnetwork/common/enums';
import { useAccountStore } from '../../stores/Account';
import BaseCardCoin from '../../components/card/BaseCardCoin.vue';
import BaseCardNFT from '../../components/card/BaseCardNFT.vue';
import BaseCardCouponCode from '../../components/card/BaseCardCouponCode.vue';
import BaseCardDiscordRole from '../../components/card/BaseCardDiscordRole.vue';
import { useTrackPageview } from '@thxnetwork/app/utils/snowplowTracker';
import onlineEllipse from '@thxnetwork/app/assets/online-ellipse.png';
import { WalletVariant } from '@thxnetwork/app/types/enums/accountVariant';
import { chainList } from '@thxnetwork/app/utils/chains';
import copyIcon from '@thxnetwork/app/assets/copy.png';
import shareIcon from '@thxnetwork/app/assets/share.png';
export default defineComponent({
    name: 'BaseViewWallet',
    components: {
        // BaseCardCoin,
        // BaseCardNFT,
        // BaseCardCouponCode,
        // BaseCardDiscordRole,
    },
    data() {
        return {
            error: '',
            isSubmitting: false,
            isRefreshing: false,
            activeFilter: { label: 'All', key: [] } as { label: string; key: number[] },
            RewardVariant,
            filters: [
                {
                    label: 'All',
                    key: [],
                },
                {
                    label: 'Coins',
                    key: [RewardVariant.Coin],
                },
                {
                    label: 'NFT',
                    key: [RewardVariant.NFT],
                },
                {
                    label: 'Discord',
                    key: [RewardVariant.DiscordRole],
                },
                {
                    label: 'Codes',
                    key: [RewardVariant.Coupon],
                },
            ] as { label: string; key: number[] }[],
            onlineEllipse,
            walletLogoMap,
            chainList,
            isCopied: false,
            copyIcon,
            shareIcon,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useAccountStore, useWalletStore),
        list() {
            return [
                ...this.walletStore.erc20,
                ...this.walletStore.erc721.filter((item) => item.chainId === this.walletStore.chainId),
                ...this.walletStore.erc1155.filter((item) => item.chainId === this.walletStore.chainId),
                ...this.walletStore.couponCodes,
                ...this.walletStore.discordRoles,
            ]
                .filter((item) => {
                    if (!this.activeFilter.key.length) return true;
                    return this.activeFilter.key.includes(item.rewardVariant);
                })
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .reverse();
        },
        isListShown() {
            return this.list.length;
        },
        twoTokens() {
            const tokens = this.list.filter((token) => token.erc20.symbol === 'USDC' || token.erc20.symbol === 'USDT');

            // if (!tokens.some((t) => t.erc20.symbol === 'USDC')) {
            //     tokens.push({
            //         erc20: { symbol: 'USDC' },
            //         walletBalance: 0,
            //     });
            // }

            if (!tokens.some((t) => t.erc20.symbol === 'USDT')) {
                tokens.push({
                    erc20: { symbol: 'USDT' },
                    walletBalance: 0,
                });
            }

            return tokens;
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
    mounted() {
        // useTrackPageview();
    },
    methods: {
        onClickSignin() {
            this.accountStore.signin();
        },
        async onClickRefresh() {
            await this.listRewards();
        },
        async listRewards() {
            this.isRefreshing = true;
            await this.walletStore.list();
            this.isRefreshing = false;
        },
        async onClickWallet(wallet: TWallet) {
            this.walletStore.setWallet(wallet);
            this.accountStore.setGlobals({ activeWalletId: wallet._id });
            this.walletStore.list();
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
    },
});
</script>

<style>
.wallet-wrap {
}

.tabs-rewards {
}

.tabs-rewards .nav-tabs {
    border-color: #232323;
}

.tabs-rewards .nav-link.active {
    --bs-nav-tabs-link-active-bg: #111113 !important;
    --bs-nav-tabs-link-active-border-color: #232323 !important;
}

.refresh-color {
    --bs-primary-rgb: #515151 !important;
}
.empty-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: 16px !important;
}
.wallet-box {
    height: 100%;
    border-radius: 5px 5px 0px 0px;
    background: var(--wallet-box-bg);
    padding: 17px 10px 0 10px;
    max-height: 100px;
    max-width: 360px;
    flex-shrink: 0;
}
.wallet-online-word {
    color: var(--wallet-online-color);
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
}
.wallet-online {
    margin-right: 2px;
}
.new-wallet-btn {
    font-size: 13px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: -0.13px;
    background: var(--btn-primary-santa);
    border: 0.753px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    padding: 2px 14px;
}
.wallet-info {
    width: 100%;
}
.wallet-text {
    color: var(--body-text);
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-align: center;
    padding: 7px 0;
    border-bottom: 1px solid var(--wallet-connected-border-color);
}
.wallet-connected {
    position: relative;
    border-radius: 12px;
    border: 1px solid var(--wallet-connected-border-color);
    background: var(--wallet-connected-bg);
    max-width: 360px;
    min-height: 245px;
}
.address-list {
    padding: 12px 20px;
}
.selected-wallet {
    color: var(--selected-wallet-color);
}
.token-display {
    display: flex;
    padding: 19px 38px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    border-radius: 6px;
    background: var(--token-display-bg);
}
.token-symbol {
    color: #a6a6a6;
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
}
.token-balance {
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
}
.wallet-boxes {
    margin-top: -40px;
}
.spinner-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.icon-shadow {
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);
    border-radius: 4px;
}
@media (max-width: 992px) {
    .wallet-box {
        height: 100px;
        max-width: 100%;
    }
    .wallet-boxes {
        justify-content: space-between;
    }
}
@media (max-width: 540px) {
    .wallet-boxes {
        flex-direction: column;
    }
    .wallet-connected {
        min-height: 300px;
        max-width: 100%;
    }
}
</style>

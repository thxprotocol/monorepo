<template>
    <div style="overflow: auto; min-height: 260px">
        <div class="d-flex p-2 m-0 align-items-center">
            <div class="flex-grow-1 pe-2 d-flex">
                Your Wallet
                <b-spinner v-if="walletStore.isLoading" class="ms-2" variant="primary" small />
            </div>
            <b-dropdown variant="primary" size="sm" no-caret>
                <template #button-content>
                    {{ activeFilter.label }}
                    <i class="fas fa-caret-down ms-1" />
                </template>
                <b-dropdown-item-button v-for="filter of filters" @click="activeFilter = filter">
                    {{ filter.label }}
                </b-dropdown-item-button>
            </b-dropdown>
        </div>
        <div v-for="(token, key) of list" :key="key" class="mb-1">
            <component :is="token.component" :token="token" />
        </div>
        <div v-if="!isListShown" class="text-center text-opaque">Nothing here...</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAuthStore } from '../../stores/Auth';
import { RewardVariant } from '@thxnetwork/common/enums';
import { useAccountStore } from '../../stores/Account';
import BaseCardCoin from '../../components/card/BaseCardCoin.vue';
import BaseCardNFT from '../../components/card/BaseCardNFT.vue';
import BaseCardCouponCode from '../../components/card/BaseCardCouponCode.vue';
import BaseCardDiscordRole from '../../components/card/BaseCardDiscordRole.vue';

export default defineComponent({
    name: 'BaseViewWallet',
    components: {
        BaseCardCoin,
        BaseCardNFT,
        BaseCardCouponCode,
        BaseCardDiscordRole,
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
        };
    },
    computed: {
        ...mapStores(useAuthStore, useAccountStore, useWalletStore),
        list() {
            return [
                ...this.walletStore.erc20.filter((item) => item.chainId === this.walletStore.chainId),
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
    },
    mounted() {
        this.listRewards();
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
    },
});
</script>

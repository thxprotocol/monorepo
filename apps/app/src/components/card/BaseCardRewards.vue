<template>
    <div style="overflow: auto">
        <div class="d-flex p-2 m-0 align-items-center">
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fas fa-wallet me-2 text-opaque" />
            </div>
            <div class="flex-grow-1 pe-2">Your Wallet</div>
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
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAuthStore } from '../../stores/Auth';
import { RewardVariant } from '@thxnetwork/common/enums';
import { useAccountStore } from '../../stores/Account';
import BaseCardERC20 from '../../components/card/BaseCardERC20.vue';
import BaseCardERC721 from '../../components/card/BaseCardERC721.vue';
import BaseCardCouponCode from '../../components/card/BaseCardCouponCode.vue';
import BaseCardDiscordRole from '../../components/card/BaseCardDiscordRole.vue';
import BaseCardGalachain from '../../components/card/BaseCardGalachain.vue';

export default defineComponent({
    name: 'BaseViewWallet',
    components: {
        BaseCardERC20,
        BaseCardERC721,
        BaseCardCouponCode,
        BaseCardDiscordRole,
        BaseCardGalachain,
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
                {
                    label: 'Galachain',
                    key: [RewardVariant.Galachain],
                },
            ] as { label: string; key: number[] }[],
        };
    },
    computed: {
        ...mapStores(useAuthStore, useAccountStore, useWalletStore),
        list() {
            return [
                ...this.walletStore.erc20,
                ...this.walletStore.erc721,
                ...this.walletStore.erc1155,
                ...this.walletStore.couponCodes,
                ...this.walletStore.discordRoles,
                ...this.walletStore.galachain,
            ]
                .filter((item) => {
                    if (!this.activeFilter.key.length) return true;
                    return this.activeFilter.key.includes(item.rewardVariant);
                })
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .reverse();
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

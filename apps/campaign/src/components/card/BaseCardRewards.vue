<template>
    <b-tabs v-if="!isEmpty" class="tabs-rewards" nav-class="px-3" content-class="p-2">
        <template #tabs-end>
            <b-button
                v-if="accountStore.isAuthenticated"
                class="text-primary ms-auto"
                size="sm"
                variant="link"
                @click="onClickRefresh"
            >
                <b-spinner v-if="walletStore.isLoading" small />
                <i v-else class="fas fa-sync-alt" style="font-size: 0.8rem" />
            </b-button>
        </template>
        <b-tab title="Coins">
            <div v-for="(token, key) of walletStore.erc20" :key="key" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
        </b-tab>
        <b-tab v-if="walletStore.erc721.length || walletStore.erc1155.length" title="NFT">
            <div v-for="(token, key) of walletStore.erc1155" :key="key" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
            <div v-for="(token, key) of walletStore.erc721" :key="key" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
        </b-tab>
        <b-tab v-if="walletStore.couponCodes.length" title="Secrets">
            <div v-for="(token, key) of walletStore.couponCodes" :key="key" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
        </b-tab>
        <b-tab v-if="walletStore.discordRoles.length" title="Discord">
            <div v-for="(token, key) of walletStore.discordRoles" :key="key" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
        </b-tab>
    </b-tabs>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import BaseCardERC20 from '../../components/card/BaseCardERC20.vue';
import BaseCardERC721 from '../../components/card/BaseCardERC721.vue';
import BaseCardCouponCode from '../../components/card/BaseCardCouponCode.vue';
import BaseCardDiscordRole from '../../components/card/BaseCardDiscordRole.vue';

export default defineComponent({
    name: 'BaseViewWallet',
    components: {
        BaseCardERC20,
        BaseCardERC721,
        BaseCardCouponCode,
        BaseCardDiscordRole,
    },
    data() {
        return {
            error: '',
            isSubmitting: false,
            isRefreshing: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useAccountStore, useWalletStore),
        list() {
            return [
                ...this.walletStore.couponCodes,
                ...this.walletStore.erc20,
                ...this.walletStore.erc721,
                ...this.walletStore.erc1155,
            ]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .reverse();
        },
        isEmpty() {
            return ![
                ...this.walletStore.couponCodes,
                ...this.walletStore.erc20,
                ...this.walletStore.erc721,
                ...this.walletStore.erc1155,
            ].length;
        },
    },
    methods: {
        onClickSignin() {
            this.accountStore.signin();
        },
        async onClickRefresh() {
            this.isRefreshing = true;
            await this.walletStore.list();
            this.isRefreshing = false;
        },
    },
});
</script>

<template>
    <b-tabs v-if="!isEmpty" nav-class="px-3" content-class="p-2">
        <template #tabs-end>
            <b-button
                class="text-primary ms-auto"
                v-if="authStore.oAuthShare"
                size="sm"
                variant="link"
                @click="onClickRefresh"
            >
                <b-spinner v-if="walletStore.isLoading" small />
                <i v-else class="fas fa-sync-alt" style="font-size: 0.8rem"></i>
            </b-button>
        </template>
        <b-tab title="Coins" v-if="walletStore.erc20.length">
            <div :key="key" v-for="(token, key) of walletStore.erc20" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
        </b-tab>
        <b-tab title="NFT" v-if="walletStore.erc721.length || walletStore.erc1155.length">
            <div :key="key" v-for="(token, key) of walletStore.erc1155" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
            <div :key="key" v-for="(token, key) of walletStore.erc721" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
        </b-tab>
        <b-tab title="Secrets" v-if="walletStore.couponCodes.length">
            <div :key="key" v-for="(token, key) of walletStore.couponCodes" class="mb-1">
                <component :is="token.component" :token="token" />
            </div>
        </b-tab>
    </b-tabs>
    <b-alert v-else variant="primary" class="px-3 py-2 mx-3" v-model="isEmpty">
        <i class="fas fa-gift me-2" />
        Nothing to see here... Yet!
    </b-alert>
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

export default defineComponent({
    name: 'BaseViewWallet',
    components: {
        BaseCardERC20,
        BaseCardERC721,
        BaseCardCouponCode,
    },
    data() {
        return {
            error: '',
            isSubmitting: false,
            isRefreshing: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore),
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
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

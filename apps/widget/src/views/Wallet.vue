<template>
    <div v-if="accountStore.isAuthenticated" class="flex-grow-1 overflow-auto order-lg-3">
        <b-alert
            variant="danger"
            show
            v-if="walletStore.wallet?.version && walletStore.wallet?.version !== walletStore.wallet?.latestVersion"
            class="mx-2 p-1 px-2 align-items-center d-flex"
        >
            <i class="fas fa-tools me-2"></i>
            Your Wallet{{ walletStore.wallet?.version ? ` (v${walletStore.wallet?.version})` : '' }} is out of date.
            <b-button class="ms-auto" size="sm" variant="primary" @click="onClickUpgrade">
                <b-spinner v-if="isSubmitting" small variant="light" />
                <template v-else>Upgrade</template>
            </b-button>
        </b-alert>

        <b-alert v-if="!list.length" variant="info" show class="mx-2 p-2 px-3">
            <i class="fas fa-question-circle me-2"></i> No tokens found for your account...
        </b-alert>

        <component :key="key" v-for="(token, key) of list" :is="token.component" :token="token" />
    </div>
    <div v-else class="d-flex flex-grow-1 align-items-center justify-content-center flex-column order-lg-3">
        <div class="px-5 w-100">
            <b-alert variant="info" show class="p-2 px-3">
                <i class="fas fa-gift me-2"></i> Sign in to list your tokens!
            </b-alert>

            <ul class="list list-unstyled">
                <li><i class="fas fa-check text-success me-2"></i> Access your smart contract wallet</li>
                <li><i class="fas fa-check text-success me-2"></i> Profit from free web3 transactions</li>
                <li><i class="fas fa-check text-success me-2"></i> Opt-in for a self-custody wallet</li>
            </ul>

            <b-button variant="primary" class="px-3 w-100" @click="onClickSignin">
                Sign in
                <i class="fas fa-chevron-right ms-2"></i>
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../stores/Wallet';
import { useAccountStore } from '../stores/Account';
import BaseCardERC20 from '../components/BaseCardERC20.vue';
import BaseCardERC721 from '../components/BaseCardERC721.vue';

export default defineComponent({
    name: 'Wallet',
    components: {
        BaseCardERC20,
        BaseCardERC721,
    },
    data: function () {
        return { error: '', isSubmitting: false, isModalUpgradeShown: false };
    },
    computed: {
        ...mapStores(useWalletStore),
        ...mapStores(useAccountStore),
        list: function (): any {
            return [...this.walletStore.erc20, ...this.walletStore.erc721, ...this.walletStore.erc1155]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .reverse();
        },
    },
    methods: {
        async onClickUpgrade() {
            this.isSubmitting = true;
            await this.walletStore.upgrade();
            await this.walletStore.getWallet();
            this.isSubmitting = false;
        },
        onClickSignin() {
            this.accountStore.signin();
        },
    },
});
</script>

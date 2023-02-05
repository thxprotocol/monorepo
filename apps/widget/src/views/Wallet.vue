<template>
    <div v-if="accountStore.isAuthenticated" class="flex-grow-1 overflow-auto">
        <b-alert v-if="!list.length" variant="info" show class="mx-2 mt-auto">
            <i class="fas fa-question-circle me-2"></i>
            No perks yet... Redeem <b-link to="/perks">perks</b-link> with <b-link to="/">points</b-link>!
        </b-alert>
        <component :key="key" v-for="(token, key) of list" :is="token.component" :token="token" />
    </div>
    <div v-else class="d-flex flex-grow-1 align-items-center justify-content-center flex-column">
        <div class="px-3 w-100">
            <b-alert variant="info" show>
                <i class="fas fa-gift me-2"></i>
                Sign in and view the perks you own!
            </b-alert>
            <ul class="list list-unstyled">
                <li><i class="fas fa-check text-success me-2"></i> Earn points rewards</li>
                <li><i class="fas fa-check text-success me-2"></i> Redeem crypto perks</li>
                <li><i class="fas fa-check text-success me-2"></i> Get exclusive deals</li>
            </ul>
            <b-button variant="primary" class="px-3" @click="onClickSignin">
                Sign in
                <i class="fas fa-chevron-right ms-2"></i>
            </b-button>
            <b-button variant="link" @click="onClickSignup"> Sign up </b-button>
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
    computed: {
        ...mapStores(useWalletStore),
        ...mapStores(useAccountStore),
        list: function (): any {
            return [...this.walletStore.erc20, ...this.walletStore.erc721].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            );
        },
    },
    methods: {
        onClickSignin() {
            this.accountStore.api.userManager.cached.signinPopup();
        },
        onClickSignup() {
            this.accountStore.api.userManager.cached.signinPopup({
                extraQueryParams: {
                    prompt: 'create',
                },
            });
        },
    },
});
</script>

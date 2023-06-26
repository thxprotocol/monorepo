<template>
    <b-navbar class="navbar-top pt-3 px-lg-3 p-lg-0">
        <div style="width: 120px" class="d-lg-none">
            <b-button variant="link" @click="onClickClose"> <i class="fas fa-times"></i></b-button>
        </div>
        <div
            v-if="!accountStore.isAuthenticated && config"
            class="pl-3 py-2 text-center text-decoration-none d-lg-none"
        >
            <b-img
                :src="config.logoUrl"
                class="navbar-logo"
                :title="decodeHTML(config.title)"
                v-b-tooltip.hover.bottom
            />
        </div>
        <b-link
            @click="onClickRefresh"
            class="pl-3 py-2 p-lg-0 m-lg-0 text-center text-decoration-none"
            v-if="accountStore.isAuthenticated && rewardsStore.rewards.length"
        >
            <div class="text-accent h1 m-0 d-flex align-items-center">
                <strong>{{ accountStore.balance }}</strong>
                <span class="ms-2 text-white" style="font-size: 16px !important">
                    <b-spinner v-if="isRefreshing" small variant="white" />
                    <i v-else class="fas fa-sync-alt" style="font-size: 0.8rem"></i>
                </span>
            </div>
            <div class="points d-block d-lg-none">points</div>
        </b-link>
        <div style="width: 120px; text-align: right">
            <template v-if="accountStore.isAuthenticated && rewardsStore.rewards.length">
                <b-button variant="link" @click="isModalPoolSubscriptionShown = true">
                    <i class="fas" :class="{ 'fa-bell-slash': isSubscribed, 'fa-bell': !isSubscribed }"></i>
                    <BaseModalPoolSubscription
                        id="pool-subscription"
                        @subscribe="onSubmitSubscription($event)"
                        @unsubscribe="onSubmitUnsubscription"
                        @hidden="isModalPoolSubscriptionShown = false"
                        :show="isModalPoolSubscriptionShown"
                        :error="error"
                    />
                </b-button>
                <b-button
                    v-if="['home', 'earn'].includes(String($route.name))"
                    variant="link"
                    v-b-toggle.collapse-filters
                >
                    <i class="fas fa-sliders-h"></i>
                </b-button>
            </template>
            <b-button
                v-if="accountStore.isAuthenticated && !rewardsStore.rewards.length"
                variant="link"
                @click="onClickRefresh"
            >
                <b-spinner v-if="isRefreshing" small variant="white" />
                <i v-else class="fas fa-sync-alt" style="font-size: 0.8rem"></i>
            </b-button>
            <b-button variant="link" v-if="!accountStore.isAuthenticated" @click="onClickSignin"> Sign in </b-button>
            <template v-else>
                <b-dropdown variant="link" no-caret right>
                    <template #button-content>
                        <i class="fas fa-ellipsis-v"></i>
                    </template>
                    <b-dropdown-item-button v-if="walletStore.wallet" size="sm" @click="onClickWallet">
                        <div class="d-flex align-items-center justify-content-between">
                            Config
                        </div>
                        <BaseModalWalletAccess
                            id="wallet-access"
                            @hidden="isModalWalletAccessShown = false"
                            :show="isModalWalletAccessShown"
                            :error="error"
                        />
                    </b-dropdown-item-button>
                    <b-dropdown-divider />
                    <b-dropdown-item-button size="sm" @click="onClickSignout">
                        <div class="d-flex align-items-center justify-content-between">
                            Signout
                            <i class="fas fa-sign-out-alt ml-auto"></i>
                        </div>
                    </b-dropdown-item-button>
                </b-dropdown>
            </template>
        </div>
    </b-navbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import { useWalletStore } from '../stores/Wallet';
import { usePerkStore } from '../stores/Perk';
import { decodeHTML } from '../utils/decode-html';
import BaseModalPoolSubscription from '../components/BaseModalPoolSubscription.vue';
import BaseModalWalletAccess from '../components/BaseModalWalletAccess.vue';

export default defineComponent({
    name: 'Home',
    components: {
        BaseModalWalletAccess,
        BaseModalPoolSubscription,
    },
    data(): any {
        return {
            decodeHTML,
            isEthereumBrowser: window.ethereum && window.matchMedia('(pointer:coarse)').matches,
            isModalPoolSubscriptionShown: false,
            isRefreshing: false,
            error: '',
        };
    },
    props: {},
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        ...mapStores(usePerkStore),
        ...mapStores(useWalletStore),
        isSubscribed() {
            const { subscription } = useAccountStore();
            return !!subscription;
        },
        walletAddress() {
            const { wallet } = useWalletStore();
            if (!wallet || !wallet.address) return '';
            return `${wallet.address.substring(0, 6)}...${wallet.address.substring(
                wallet.address.length - 4,
                wallet.address.length,
            )}`;
        },
        config() {
            const { poolId, getConfig } = useAccountStore();
            if (!poolId) return;
            return getConfig(poolId);
        },
    },
    methods: {
        async onSubmitSubscription(email: string) {
            try {
                await this.accountStore.subscribe(email);
                this.isModalPoolSubscriptionShown = false;
            } catch (error) {
                this.error = 'This e-mail is used by someone else.';
            }
        },
        async onSubmitUnsubscription() {
            await this.accountStore.unsubscribe();
            this.isModalPoolSubscriptionShown = false;
        },
        onClickSignin() {
            this.accountStore.signin();
        },
        onClickSignout() {
            this.accountStore.signout();
        },
        onClickClose() {
            const { origin } = this.accountStore.getConfig(this.accountStore.poolId);
            if (this.isEthereumBrowser) {
                // if (window.opener) {
                //     window.close();
                // } else {
                // }
                window.open(origin, '_self');
            } else {
                window.top?.postMessage({ message: 'thx.widget.toggle' }, origin);
            }
        },
        onClickWallet() {
            this.$router.push(`/${this.accountStore.poolId}/wallet`);
        },
        async onClickRefresh() {
            this.isRefreshing = true;
            await this.walletStore.list();
            await this.accountStore.getBalance();
            this.isRefreshing = false;
        },
    },
});
</script>

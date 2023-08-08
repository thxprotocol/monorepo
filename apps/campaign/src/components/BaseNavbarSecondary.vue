<template>
    <b-navbar class="navbar-top pt-3 px-lg-3 p-lg-0">
        <div style="width: 120px" class="d-lg-none">
            <b-button variant="link" @click="onClickClose"> <i class="fas fa-times"></i></b-button>
        </div>
        <b-link
            @click="onClickRefresh"
            class="pl-3 py-2 p-lg-0 m-lg-0 text-center text-decoration-none"
            v-if="authStore.oAuthShare && rewardsStore.rewards.length"
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
        <div v-else class="pl-3 py-2 text-center text-decoration-none d-lg-none">
            <b-img
                v-if="config"
                class="navbar-logo"
                :src="config.logoUrl"
                v-b-tooltip.hover.bottom="{ title: decodeHTML(config.title) }"
            />
        </div>
        <div style="width: 120px; text-align: right">
            <template
                v-if="
                    authStore.oAuthShare &&
                    rewardsStore.rewards.length &&
                    ['home', 'quests'].includes(String($route.name))
                "
            >
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
                <b-button variant="link" v-b-toggle.collapse-filters @click.prevent>
                    <i class="fas fa-sliders-h"></i>
                </b-button>
            </template>
            <b-button
                v-if="authStore.oAuthShare && !rewardsStore.rewards.length"
                variant="link"
                @click="onClickRefresh"
            >
                <b-spinner v-if="isRefreshing" small variant="white" />
                <i v-else class="fas fa-sync-alt" style="font-size: 0.8rem"></i>
            </b-button>
            <b-button v-if="!authStore.oAuthShare" @click="onClickSignin" variant="link">
                <b-spinner v-if="accountStore.isAuthenticated === false" small variant="white" />
                <template v-else>Sign in</template>
            </b-button>
            <template v-else>
                <b-dropdown variant="link" no-caret right>
                    <template #button-content>
                        <i class="fas fa-ellipsis-v"></i>
                    </template>

                    <b-dropdown-item-button v-if="walletAddress" size="sm" @click="onClickWallet">
                        {{ walletAddress }}
                    </b-dropdown-item-button>

                    <b-dropdown-item-button @click="isModalWalletSettingsShown = true" size="sm">
                        <div class="d-flex align-items-center justify-content-between">Settings</div>
                    </b-dropdown-item-button>

                    <b-dropdown-divider />
                    <b-dropdown-item-button size="sm" @click="onClickSignout">
                        <div class="d-flex align-items-center justify-content-between">
                            Sign out
                            <i class="fas fa-sign-out-alt ml-auto"></i>
                        </div>
                    </b-dropdown-item-button>
                </b-dropdown>
                <BaseModalWalletCreate
                    id="wallet-create"
                    @hidden="isModalWalletCreateShown = false"
                    :show="isModalWalletCreateShown"
                />
                <BaseModalWalletSettings
                    id="wallet-config"
                    @hidden="isModalWalletSettingsShown = false"
                    :show="isModalWalletSettingsShown"
                />
                <BaseModalWalletRecovery
                    id="wallet-recovery"
                    @hidden="isModalWalletRecoveryShown = false"
                    :show="isModalWalletRecoveryShown"
                />
            </template>
        </div>
    </b-navbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';
import { useAuthStore } from '../stores/Auth';
import { useRewardStore } from '../stores/Reward';
import { useWalletStore } from '../stores/Wallet';
import { usePerkStore } from '../stores/Perk';
import { decodeHTML } from '../utils/decode-html';
import { AccountVariant } from '../types/enums/accountVariant';
import BaseModalPoolSubscription from '../components/BaseModalPoolSubscription.vue';
import BaseModalWalletCreate from '../components/BaseModalWalletCreate.vue';
import BaseModalWalletSettings from '../components/BaseModalWalletSettings.vue';
import BaseModalWalletRecovery from '../components/BaseModalWalletRecovery.vue';
import { getIsMobile } from '../utils/user-agent';

export default defineComponent({
    name: 'BaseNavbarSecondary',
    components: {
        BaseModalWalletCreate,
        BaseModalWalletSettings,
        BaseModalWalletRecovery,
        BaseModalPoolSubscription,
    },
    data(): any {
        return {
            AccountVariant,
            decodeHTML,
            error: '',
            isRefreshing: false,
            isModalWalletCreateShown: false,
            isModalWalletSettingsShown: false,
            isModalWalletRecoveryShown: false,
            isModalPoolSubscriptionShown: false,
        };
    },
    props: {},
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
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
    watch: {
        // OAuthshare retrieved but device share and security quesiton not found
        'authStore.isSecurityQuestionAvailable'(isSecurityQuestionAvailable) {
            const { oAuthShare, isDeviceShareAvailable } = this.authStore;
            if (!oAuthShare) return;

            this.isModalWalletCreateShown = isDeviceShareAvailable && !(isSecurityQuestionAvailable ?? false);
            this.isModalWalletCreateShown = !isDeviceShareAvailable && !(isSecurityQuestionAvailable ?? false);
            this.isModalWalletRecoveryShown = !isDeviceShareAvailable && (isSecurityQuestionAvailable ?? false);
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
        async onClickSignin() {
            this.accountStore.signin();
        },
        onClickSignout() {
            this.accountStore.signout();
        },
        onClickClose() {
            const { origin } = this.accountStore.getConfig(this.accountStore.poolId);
            if (getIsMobile()) {
                window.open(origin, '_self');
            } else {
                window.top?.postMessage({ message: 'thx.widget.toggle' }, origin);
            }
        },
        onClickWallet() {
            this.$router.push(`/c/${this.accountStore.poolId}/wallet`);
        },
        async onClickRefresh() {
            this.isRefreshing = true;
            await Promise.all([this.walletStore.list(), this.accountStore.getBalance()]);
            this.isRefreshing = false;
        },
    },
});
</script>

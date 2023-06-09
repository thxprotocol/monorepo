<template>
    <div id="main" class="d-flex flex-column h-100">
        <b-navbar class="navbar-top pt-3">
            <div style="width: 120px">
                <b-button variant="link" @click="onClickClose"> <i class="fas fa-times"></i></b-button>
            </div>
            <div class="pl-3 py-2 text-center text-decoration-none" v-if="!accountStore.isAuthenticated && config">
                <b-img
                    :src="config.logoUrl"
                    class="navbar-logo"
                    :title="decodeHTML(config.title)"
                    v-b-tooltip.hover.bottom
                />
            </div>
            <b-link
                @click="onClickRefresh"
                class="pl-3 py-2 text-center text-decoration-none"
                v-if="accountStore.isAuthenticated && rewardsStore.rewards.length"
            >
                <div class="text-accent h1 m-0 d-flex align-items-center">
                    <strong>{{ accountStore.balance }}</strong>
                    <span class="ms-2 text-white" style="font-size: 16px !important">
                        <b-spinner v-if="isRefreshing" small variant="white" />
                        <i v-else class="fas fa-sync-alt" style="font-size: 0.8rem"></i>
                    </span>
                </div>
                <div class="points">points</div>
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
                <b-button variant="link" v-if="!accountStore.isAuthenticated" @click="onClickSignin">
                    Sign in
                </b-button>
                <template v-else>
                    <b-dropdown variant="link" no-caret right>
                        <template #button-content>
                            <i class="fas fa-ellipsis-v"></i>
                        </template>
                        <b-dropdown-item-button v-if="walletStore.wallet" size="sm" @click="onClickWallet">
                            <div class="d-flex align-items-center justify-content-between">
                                {{ walletAddress }}
                                <i class="fas fa-clipboard ml-auto" v-clipboard:copy="walletStore.wallet.address"></i>
                            </div>
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
        <router-view />
        <b-navbar v-if="rewardsStore.rewards.length || perksStore.perks.length" class="navbar-bottom">
            <router-link
                v-if="rewardsStore.rewards.length"
                :to="`/${accountStore.poolId}/earn`"
                class="d-flex flex-column justify-content-center align-items-center"
            >
                <i class="fas fa-trophy"></i>
                Quests
            </router-link>
            <router-link
                v-if="perksStore.perks.length"
                :to="`/${accountStore.poolId}/store`"
                class="d-flex flex-column justify-content-center align-items-center"
            >
                <i class="fas fa-store"></i>
                Rewards
            </router-link>
            <router-link
                :to="`/${accountStore.poolId}/wallet`"
                class="d-flex flex-column justify-content-center align-items-center"
            >
                <i class="fas fa-wallet"></i>
                Wallet
            </router-link>
        </b-navbar>
    </div>
</template>
<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { WIDGET_URL, GTM } from './config/secrets';
import { useAccountStore } from './stores/Account';
import { useRewardStore } from './stores/Reward';
import { useWalletStore } from './stores/Wallet';
import { usePerkStore } from './stores/Perk';
import { initGTM } from './utils/ga';
import { track } from '@thxnetwork/mixpanel';
import BaseModalPoolSubscription from './components/BaseModalPoolSubscription.vue';

import './scss/main.scss';

export default defineComponent({
    components: { BaseModalPoolSubscription },
    data() {
        return {
            isEthereumBrowser: window.ethereum && window.matchMedia('(pointer:coarse)').matches,
            isModalPoolSubscriptionShown: false,
            isRefreshing: false,
            error: '',
        };
    },
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
    async created() {
        if (GTM) initGTM();
        window.onmessage = this.onMessage;
    },
    methods: {
        decodeHTML(input: string) {
            var doc = new DOMParser().parseFromString(input, 'text/html');
            return doc.documentElement.textContent;
        },
        async onMessage(event: MessageEvent) {
            const { getConfig, poolId } = this.accountStore;
            const origin = getConfig(poolId).origin;
            const localOrigin = new URL(origin).origin;
            if (!WIDGET_URL || event.origin !== localOrigin) return;

            switch (event.data.message) {
                case 'thx.iframe.navigate': {
                    this.onIframeNavigate(event.data.path);
                    break;
                }
                case 'thx.iframe.show': {
                    this.onIframeShow(origin, event.data.isShown);
                    break;
                }
                case 'thx.referral.claim.create': {
                    this.onReferralClaimCreate(event.data.uuid);
                    break;
                }
                case 'thx.config.ref': {
                    this.onReferralConfigUpdate(event.data.ref);
                    break;
                }
            }
        },
        onReferralConfigUpdate(ref: string) {
            const { setConfig, poolId } = this.accountStore;
            setConfig(poolId, { ref } as TWidgetConfig);
        },
        onIframeNavigate(path: string) {
            this.$router.push(path);
        },
        async onReferralClaimCreate(uuid: string) {
            const { account, getConfig, setConfig, poolId, api, getBalance } = this.accountStore;
            const { ref } = getConfig(poolId);
            if (!ref) return;

            const { sub } = JSON.parse(atob(ref));
            await api.rewardsManager.referral.claim({ uuid, sub });

            setConfig(poolId, { ref: '' } as TWidgetConfig);
            getBalance();

            track('UserCreates', [account?.sub, 'referral reward claim', { poolId, origin: getConfig(poolId).origin }]);
        },
        async onIframeShow(origin: string, isShown: boolean) {
            const { api, signin, account, poolId } = this.accountStore;
            const user = await api.userManager.cached.getUser();

            if (isShown && user && user.expired) {
                signin();
            }

            track('UserOpens', [account?.sub || '', `widget iframe`, { origin, poolId, isShown }]);
        },
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

<style>
.fa-bell {
    animation: shake 10s;
    animation-iteration-count: infinite;
}

@keyframes shake {
    0% {
        transform: translate(0px, 0px) rotate(0deg);
    }
    95% {
        transform: translate(-1px, 2px) rotate(-1deg);
    }
    96% {
        transform: translate(-2px, 1px) rotate(0deg);
    }
    97% {
        transform: translate(2px, 1px) rotate(-1deg);
    }
    98% {
        transform: translate(-1px, -1px) rotate(1deg);
    }
    99% {
        transform: translate(1px, 2px) rotate(-1deg);
    }
    100% {
        transform: translate(0px, 0px) rotate(0deg);
    }
}

.navbar-logo {
    height: auto;
    max-height: 50px;
    max-width: 100px;
}
</style>

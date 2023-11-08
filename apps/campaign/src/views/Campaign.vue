<template>
    <div v-if="!isIframe" class="px-3 p-1 bg-dark text-white d-none d-lg-flex justify-content-between">
        <b-link to="/" class="text-white text-opaque text-decoration-none">
            <i class="fas fa-caret-left me-1" />
            Back
        </b-link>
        <b-link :href="accountStore.config.domain" class="text-white text-opaque text-decoration-none">
            {{ decodeHTML(accountStore.config.title) }}
            <i v-if="!accountStore.config.active" class="fas fa-check-circle text-success" />
        </b-link>
        <b-link :href="accountStore.config.domain" target="_blank" class="text-white text-opaque text-decoration-none">
            {{ domain }}
            <i class="fas fa-external-link-alt ms-1 small" />
        </b-link>
    </div>
    <div class="d-flex flex-column h-100 container-lg p-0">
        <BaseNavbarSecondary class="d-flex d-lg-none" />
        <b-container
            v-if="accountStore.isAuthenticated === false"
            style="max-width: none"
            class="d-flex align-items-center justify-content-center h-100 order-lg-1 mt-lg-5"
        >
            <b-spinner type="grow" variant="primary" small />
        </b-container>
        <template v-else>
            <b-container class="order-lg-1 d-none d-lg-block">
                <b-row>
                    <b-col xl="10" offset-xl="1">
                        <b-card
                            v-if="
                                authStore.oAuthShare && rewardsStore.quests.length && accountStore.config.backgroundUrl
                            "
                            class="bg-splash mx-auto"
                            body-class="d-flex justify-content-center align-items-center"
                            :style="{ backgroundImage: `url('${accountStore.config.backgroundUrl}')` }"
                        >
                            <div
                                class="d-flex justify-content-center align-items-center p-3"
                                style="border-radius: 5px; background: rgba(0, 0, 0, 0.35)"
                            >
                                <b-avatar
                                    size="80"
                                    :src="accountStore.account?.profileImg"
                                    class="gradient-border-xl"
                                />
                                <div class="px-3" style="min-width: 200px">
                                    <h3 class="text-white mb-0">{{ accountStore.account?.username }}</h3>
                                    <div class="text-opaque mb-1">Rank: #{{ accountStore.account?.rank }}</div>
                                    <b-progress
                                        style="height: 12px"
                                        variant="success"
                                        show-value
                                        :value="Number(accountStore.balance)"
                                        :max="Number(accountStore.balance) + Number(rewardsStore.availablePoints)"
                                    />
                                </div>
                            </div>
                        </b-card>
                    </b-col>
                </b-row>
            </b-container>
            <router-view />
        </template>
        <BaseNavbarPrimary :screen-width="screenWidth" />
    </div>
</template>
<script lang="ts">
import { mapStores } from 'pinia';
import { track } from '@thxnetwork/mixpanel';
import { defineComponent } from 'vue';
import { GTM } from '../config/secrets';
import { useAuthStore } from '../stores/Auth';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import { useWalletStore } from '../stores/Wallet';
import { usePerkStore } from '../stores/Perk';
import { initGTM } from '../utils/ga';
import { decodeHTML } from '../utils/decode-html';

export default defineComponent({
    data() {
        return {
            decodeHTML,
            isEthereumBrowser: window.ethereum && window.matchMedia('(pointer:coarse)').matches,
            isModalPoolSubscriptionShown: false,
            isModalWalletAccessShown: false,
            isRefreshing: false,
            isIframe: window.self !== window.top,
            error: '',
            screenWidth: window.innerWidth,
        };
    },
    computed: {
        ...mapStores(useAuthStore),
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
        domain() {
            return new URL(this.accountStore.config.domain).hostname;
        },
    },
    async created() {
        if (GTM) initGTM();
        window.addEventListener('resize', this.onResize.bind(this));
        window.onmessage = this.onMessage;
        this.accountStore.postMessage({ message: 'thx.widget.ready' });
    },
    methods: {
        onResize() {
            this.screenWidth = window.innerWidth;
        },
        async onMessage(event: MessageEvent) {
            const { origin } = this.accountStore.config;
            const localOrigin = origin && new URL(origin).origin;
            if (event.origin !== localOrigin) return;

            const mapMessage: { [message: string]: () => void } = {
                'thx.iframe.navigate': () => this.onWidgetNavigate(event.data.path),
                'thx.iframe.show': () => this.onWidgetShow(origin, event.data.isShown),
                'thx.config.ref': () => this.onInviteQuestUpdate(event.data.ref),
                'thx.referral.claim.create': () => this.onInviteQuestComplete(event.data.uuid),
                'thx.auth.signout': () => this.onSignout,
                'thx.auth.signin': () => this.onSignin,
                'thx.quests.list': () => this.onQuestsList,
            };

            mapMessage[event.data.message]();
        },
        onQuestsList() {
            this.rewardsStore.list();
        },
        onSignin() {
            this.accountStore.signin();
        },
        onSignout() {
            this.accountStore.signout();
        },
        onInviteQuestUpdate(ref: string) {
            if (!ref) return;
            const { setConfig, poolId } = this.accountStore;
            setConfig(poolId, { ref } as TWidgetConfig);
        },
        onInviteQuestComplete(uuid: string) {
            this.rewardsStore.completeInviteQuest(uuid);
        },
        onWidgetShow(origin: string, isShown: boolean) {
            const { account, poolId } = this.accountStore;
            track('UserOpens', [account?.sub || '', `widget iframe`, { origin, poolId, isShown }]);
        },
        onWidgetNavigate(path: string) {
            this.$router.push(path);
        },
    },
});
</script>

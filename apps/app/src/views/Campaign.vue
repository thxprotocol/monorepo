<template>
    <div class="d-flex flex-column h-100 p-0 h-vertical">
        <BaseNavbarSecondary v-if="accountStore.isMobile" />
        <BaseCardCampaignJumbotron :height="100" />
        <router-view class="order-lg-2 overflow-mobile flex-grow-1" />
        <BaseNavbarPrimary v-if="accountStore.isMobile" />
        <BaseModalInvite :show="isModalInviteShown" />
    </div>
</template>
<script lang="ts">
import { mapStores } from 'pinia';
import { track } from '@thxnetwork/app/utils/mixpanel';
import { defineComponent } from 'vue';
import { GTM, WIDGET_URL } from '../config/secrets';
import { useAuthStore } from '../stores/Auth';
import { useAccountStore } from '../stores/Account';
import { useQuestStore } from '../stores/Quest';
import { useRewardStore } from '../stores/Reward';
import { initGTM } from '../utils/ga';

export default defineComponent({
    data() {
        return {
            error: '',
            screenWidth: window.innerWidth,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore, useRewardStore),
        isModalInviteShown(): boolean {
            return !!this.$route.params.code;
        },
    },
    watch: {
        'questStore.isLoading'(isLoading: boolean) {
            if (isLoading) return;
            this.redirect();

            const amount = this.questStore.quests.filter((r) => r.isAvailable).length;
            this.accountStore.postMessage({ message: 'thx.reward.amount', amount });
        },
    },
    async created() {
        if (GTM) initGTM();
        window.addEventListener('resize', this.accountStore.onResize);
        window.onmessage = this.onMessage;
        this.accountStore.onResize();
        this.accountStore.postMessage({ message: 'thx.widget.ready' });

        await this.questStore.list();
        await this.rewardStore.list();
    },
    methods: {
        // This redirects the user to the wallet if there are no quest and rewards
        redirect() {
            const basePath = `/c/${this.accountStore.config.slug}`;
            const isQuestCampaign = !this.accountStore.config.isQRCodeCampaign;

            // Skip redirect for regular campaigns and the NFT collect page
            if (isQuestCampaign || this.$route.name === 'collect') return;

            if (this.accountStore.isAuthenticated === null) {
                return this.$router.push(`${basePath}/about`);
            }

            if (!this.questStore.isLoading) {
                return this.$router.push(`${basePath}/wallets`);
            }
        },
        async onMessage(event: MessageEvent) {
            const { origin } = this.accountStore.config;
            const localOrigin = origin && new URL(origin).origin;
            const messageMap: { [message: string]: () => void } = {
                'thx.iframe.navigate': () => this.onWidgetNavigate(event.data.path),
                'thx.iframe.show': () => this.onWidgetShow(origin, event.data.isShown),
                'thx.auth.identity': () => this.onSetIdentity(event.data.identity),
                'thx.auth.signout': () => this.onSignout,
                'thx.auth.signin': () => this.onSignin,
                'thx.auth.callback': () => this.accountStore.onSignedIn(event.data.session),
            };

            if ([localOrigin, WIDGET_URL].includes(event.origin) && messageMap[event.data.message]) {
                messageMap[event.data.message]();
            }
        },
        async onSetIdentity(identity: string) {
            // Store in localstorage and patch identity on auth success
            this.accountStore.storeIdentity(identity);

            // If authenticated already patch immediately
            if (this.accountStore.isAuthenticated) {
                await this.accountStore.connectIdentity();
            }
        },
        onSignin() {
            // this.accountStore.signin();
        },
        onSignout() {
            this.accountStore.signout();
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
<style lang="scss">
@media (max-width: 992px) {
    .overflow-mobile {
        overflow-x: none;
        overflow-y: auto;
    }
}
@media (min-width: 992px) {
    .h-vertical {
        height: calc(100% - 30px) !important;
    }
}
</style>

<template>
    <div class="d-flex flex-column h-100 p-0">
        <BaseNavbarSecondary class="d-flex d-lg-none" />
        <b-container
            v-if="accountStore.isAuthenticated === false"
            style="max-width: none"
            class="d-flex align-items-center justify-content-center h-100 order-lg-1 mt-lg-5"
        >
            <b-spinner type="grow" variant="primary" small />
        </b-container>
        <template v-else>
            <BaseCardAccountRank />
            <router-view class="order-lg-2 overflow-mobile" />
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
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
    },
    watch: {
        'accountStore.isAuthenticated': {
            handler() {
                this.questStore.list();
                this.redirect();
            },
            immediate: true,
        },
        'questStore.isLoading'() {
            this.redirect();

            const amount = this.questStore.quests.filter((r) => !r.isClaimed).length;
            this.accountStore.postMessage({ message: 'thx.reward.amount', amount });
        },
    },
    async created() {
        if (GTM) initGTM();
        window.addEventListener('resize', this.accountStore.onResize);
        window.onmessage = this.onMessage;
        this.accountStore.onResize();
        this.accountStore.postMessage({ message: 'thx.widget.ready' });
    },
    methods: {
        // This redirects the user to the wallet if there are no quest and rewards
        redirect() {
            const { isAuthenticated } = this.accountStore;
            const { isLoading } = this.questStore;
            if (isAuthenticated && !isLoading && !this.questStore.quests.length && !this.rewardStore.rewards.length) {
                this.$router.push(`/c/${this.accountStore.config.slug}/wallets`);
            }
        },
        async onMessage(event: MessageEvent) {
            const { origin } = this.accountStore.config;
            const localOrigin = origin && new URL(origin).origin;
            const messageMap: { [message: string]: () => void } = {
                'thx.iframe.navigate': () => this.onWidgetNavigate(event.data.path),
                'thx.iframe.show': () => this.onWidgetShow(origin, event.data.isShown),
                'thx.config.ref': () => this.onInviteQuestUpdate(event.data.ref),
                'thx.referral.claim.create': () => this.onInviteQuestComplete(event.data.uuid),
                'thx.auth.identity': () => this.onSetIdentity(event.data.identity),
                'thx.auth.signout': () => this.onSignout,
                'thx.auth.signin': () => this.onSignin,
            };

            if (event.origin !== localOrigin || !event.data.message || !messageMap[event.data.message]) return;

            messageMap[event.data.message]();
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
            this.questStore.completeInviteQuest(uuid);
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
<style>
@media (max-width: 992px) {
    .overflow-mobile {
        overflow-x: none;
        overflow-y: auto;
    }
}
</style>

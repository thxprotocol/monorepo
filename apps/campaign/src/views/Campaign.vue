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
            <b-container
                v-if="questStore.quests.length"
                class="order-lg-1"
                :class="{ 'd-none d-lg-block': isRouteRanking }"
            >
                <b-row>
                    <b-col xl="10" offset-xl="1">
                        <BaseCardAccountRank />
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
import { useQuestStore } from '../stores/Quest';
import { useWalletStore } from '../stores/Wallet';
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
        ...mapStores(useWalletStore),
        isSubscribed() {
            const { subscription } = useAccountStore();
            return !!subscription;
        },
        isRouteRanking() {
            return this.$route.name !== 'ranking';
        },
    },
    watch: {
        'accountStore.isAuthenticated'() {
            const { isAuthenticated, isQuestsLoaded } = this.accountStore;
            this.redirect(isAuthenticated, isQuestsLoaded);
        },
        'accountStore.isQuestsLoaded'() {
            const { isAuthenticated, isQuestsLoaded } = this.accountStore;
            this.redirect(isAuthenticated, isQuestsLoaded);
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
        redirect(isAuthenticated: boolean | null, isQuestsLoaded: boolean) {
            if (
                isAuthenticated &&
                isQuestsLoaded &&
                !this.questStore.quests.length &&
                !this.rewardStore.rewards.length
            ) {
                this.$router.push(`/c/${this.accountStore.config.slug}/about`);
                this.accountStore.isSidebarShown = true;
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
                'thx.quests.list': () => this.onQuestsList,
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
        onQuestsList() {
            this.questStore.list();
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

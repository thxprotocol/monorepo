<template>
    <div
        v-if="config"
        class="d-none d-lg-block bg-splash"
        :style="{ backgroundImage: `url(${config?.backgroundUrl})` }"
    ></div>
    <div id="main" class="d-flex flex-column h-100 container-lg my-lg-3 p-0">
        <BaseNavbarSecondary class="d-flex d-lg-none" />
        <b-container class="order-lg-1 d-none d-lg-block" style="max-width: none">
            <b-row>
                <b-col lg="10" offset-lg="1">
                    <h2 style="text-transform: capitalize">
                        {{ $route.name }}
                    </h2>
                </b-col>
            </b-row>
        </b-container>
        <router-view />
        <BaseNavbarPrimary />
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
import BaseNavbarPrimary from './components/BaseNavbarPrimary.vue';
import BaseNavbarSecondary from './components/BaseNavbarSecondary.vue';

import './scss/main.scss';

export default defineComponent({
    components: {
        BaseNavbarPrimary,
        BaseNavbarSecondary,
    },
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
            if (!ref) return;
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
    },
});
</script>

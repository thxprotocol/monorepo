<template>
    <b-navbar
        v-if="rewardsStore.rewards.length || perksStore.perks.length"
        class="navbar-bottom my-lg-3 px-lg-3 order-lg-0"
    >
        <div v-if="config" class="pl-3 py-2 text-center text-decoration-none d-none d-lg-block me-lg-5">
            <b-img
                :src="config.logoUrl"
                class="navbar-logo"
                v-b-tooltip.hover.bottom="{ title: decodeHTML(config.title) }"
            />
        </div>
        <router-link v-if="rewardsStore.rewards.length" :to="`/c/${accountStore.poolId}/quests`">
            <i class="fas fa-trophy me-lg-3"></i>
            <div>Quests</div>
        </router-link>
        <router-link v-if="perksStore.perks.length" :to="`/c/${accountStore.poolId}/rewards`">
            <i class="fas fa-store me-lg-3"></i>
            <div>Rewards</div>
        </router-link>
        <router-link :to="`/c/${accountStore.poolId}/wallet`">
            <i class="fas fa-wallet mr-lg-3"></i>
            <div>Wallet</div>
        </router-link>
        <BaseNavbarSecondary v-if="isNavbarSecondaryShown" class="ms-auto d-none d-lg-flex" />
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
import BaseNavbarSecondary from '../components/BaseNavbarSecondary.vue';

export default defineComponent({
    components: {
        BaseNavbarSecondary,
    },
    data(): any {
        return { decodeHTML };
    },
    props: {},
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        ...mapStores(usePerkStore),
        ...mapStores(useWalletStore),
        isNavbarSecondaryShown() {
            return (() => window.innerWidth > 768)();
        },
        config() {
            const { poolId, getConfig } = useAccountStore();
            if (!poolId) return;
            return getConfig(poolId);
        },
    },
});
</script>

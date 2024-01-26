<template>
    <b-navbar
        :container="false"
        v-if="questStore.quests.length || rewardStore.rewards.length"
        class="navbar-bottom mb-lg-3 px-lg-3 order-lg-0"
    >
        <div
            v-if="accountStore.config"
            style="width: 120px"
            class="pl-3 py-2 text-decoration-none d-none d-lg-block me-auto"
        >
            <b-img
                :src="accountStore.config.logoUrl"
                class="navbar-logo"
                v-b-tooltip.hover.bottom="{ title: decodeHTML(accountStore.config.title) }"
            />
        </div>
        <router-link v-if="isQuestCampaign" :to="`/c/${accountStore.config.slug}/quests`">
            <i class="fas fa-tasks me-lg-3"></i>
            <div>Quests</div>
        </router-link>
        <router-link v-if="isQuestCampaign" :to="`/c/${accountStore.config.slug}/rewards`">
            <i class="fas fa-gift me-lg-3"></i>
            <div>Rewards</div>
        </router-link>
        <router-link v-if="isQuestCampaign" :to="`/c/${accountStore.config.slug}/ranking`">
            <i class="fas fa-trophy mr-lg-3"></i>
            <div>Rank</div>
        </router-link>
        <b-link
            v-if="isQuestCampaign && accountStore.isMobile"
            :class="{ 'text-opaque': !accountStore.isAuthenticated }"
            :disabled="!accountStore.isAuthenticated"
            @click="accountStore.isSidebarShown = true"
        >
            <i class="fas fa-wallet mr-lg-3"></i>
            <div>Wallet</div>
        </b-link>
        <BaseNavbarSecondary class="ms-auto d-none d-lg-flex" />
    </b-navbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { useRewardStore } from '../../stores/Reward';
import { decodeHTML } from '../../utils/decode-html';

export default defineComponent({
    data() {
        return { decodeHTML };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
        isQuestCampaign() {
            return this.questStore.quests.length || this.rewardStore.rewards.length;
        },
    },
});
</script>

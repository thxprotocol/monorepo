<template>
    <b-navbar
        v-if="!accountStore.config.isQRCodeCampaign"
        :container="false"
        class="navbar-bottom shadow px-lg-3 order-lg-0"
    >
        <!-- <div
            v-if="accountStore.config"
            style="width: 120px"
            class="pl-3 py-2 text-decoration-none d-none d-lg-block me-auto"
        >
            <b-img
                v-b-tooltip.hover.bottom="{ title: decodeHTML(accountStore.config.title) }"
                :src="accountStore.config.logoUrl"
                class="navbar-logo"
            />
        </div> -->
        <!-- <router-link :to="`/c/${accountStore.config.slug}/quests`">
            <i class="fas fa-tasks me-lg-3" />
            <div>Quests</div>
        </router-link>
        <router-link :to="`/c/${accountStore.config.slug}/rewards`">
            <i class="fas fa-gift me-lg-3" />
            <div>Rewards</div>
        </router-link>
        <router-link :to="`/c/${accountStore.config.slug}/ranking`">
            <i class="fas fa-trophy mr-lg-3" />
            <div>Rank</div>
        </router-link>
        <router-link v-if="accountStore.isMobile" :to="`/c/${accountStore.config.slug}/wallets`">
            <i class="fas fa-wallet mr-lg-3" />
            <div>Wallet</div>
        </router-link> -->
        <a
            :style="{
                background:
                    selectedPart === 'quests'
                        ? 'linear-gradient(270deg, #5D2A2A 0%, #944 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
            }"
            @click="selectNavItem('quests')"
        >
            <img :src="imgQuests" alt="quests" width="24" height="24" />
            <div class="navbar-item-label">Quests</div>
        </a>
        <a
            :style="{
                background:
                    selectedPart === 'rewards'
                        ? 'linear-gradient(270deg, #5D2A2A 0%, #944 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
            }"
            @click="selectNavItem('rewards')"
        >
            <img :src="imgRewards" alt="rewards" width="24" height="24" />
            <div class="navbar-item-label">Rewards</div>
        </a>
        <a
            :style="{
                background:
                    selectedPart === 'leaderboard'
                        ? 'linear-gradient(270deg, #5D2A2A 0%, #944 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
            }"
            @click="selectNavItem('leaderboard')"
        >
            <img :src="imgLeaderboard" alt="leaderboard" width="24" height="24" />
            <div class="navbar-item-label">Rank</div>
        </a>
        <a
            :style="{
                background:
                    selectedPart === 'wallet'
                        ? 'linear-gradient(270deg, #5D2A2A 0%, #944 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
            }"
            @click="selectNavItem('wallet')"
        >
            <img :src="imgWallet" alt="wallet" width="24" height="24" />
            <div class="navbar-item-label">Wallet</div>
        </a>
        <a
            :style="{
                background:
                    selectedPart === 'transactions'
                        ? 'linear-gradient(270deg, #5D2A2A 0%, #944 100%)'
                        : 'rgba(255, 255, 255, 0.02)',
            }"
            @click="selectNavItem('transactions')"
        >
            <img :src="imgTransactions" alt="transactions" width="24" height="24" />
            <div class="navbar-item-label">Transactions</div>
        </a>
        <BaseNavbarSecondary v-if="!accountStore.isMobile" class="ms-auto" />
    </b-navbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';
import { useRewardStore } from '../../stores/Reward';
import { decodeHTML } from '../../utils/decode-html';
import imgQuests from '../../assets/quest.png';
import imgRewards from '../../assets/reward.png';
import imgLeaderboard from '../../assets/leader.png';
import imgWallet from '../../assets/wallet.png';
import imgTransactions from '../../assets/transaction.png';

export default defineComponent({
    props: {
        selectedPart: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            imgQuests,
            imgRewards,
            imgLeaderboard,
            imgWallet,
            imgTransactions,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
        isQuestCampaign() {
            return this.questStore.quests.length || this.rewardStore.rewards.length;
        },
    },
    methods: {
        selectNavItem(item: string) {
            this.$emit('nav-clicked', item);
        },
    },
});
</script>

<style>
.navbar-bottom {
    width: 100%;
    position: fixed;
    bottom: 0px;
    z-index: 22;
    background: #181818;
    box-shadow: 0px 1px 5px 0px rgba(74, 44, 44, 0.36) inset, 0px -2px 20px -16px rgba(15, 15, 15, 0.4) !important;
    backdrop-filter: blur(27px);
    zoom: 0.75;
    left: 0;
    padding: 1rem;
}

.navbar-bottom a {
    width: 80px;
    height: 50px;
    padding: 5px;
}

.navbar-item-label {
    color: #d4d4d4;
    text-align: center;
    leading-trim: both;
    text-edge: cap;
    font-feature-settings: 'liga' off, 'clig' off;
    font-family: Poppins;
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px;
}

.nav-campaign .router-link-exact-active {
    background-color: rgba(229, 229, 229, 0.11) !important;
}
</style>

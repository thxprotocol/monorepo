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
            v-for="item in navbarItems"
            :key="item.key"
            :class="['navbar-item', { active: selectedPart === item.key }]"
            :style="{ width: item.key === 'transactions' ? '80px' : '' }"
            @click="selectNavItem(item.key)"
        >
            <span :class="['navbar-icon', `navbar-icon-${item.key}`]" />
            <div class="navbar-item-label">{{ item.label }}</div>
        </a>
        <!-- <BaseNavbarSecondary v-if="!accountStore.isMobile" class="ms-auto" /> -->
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
    props: {
        selectedPart: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
        isQuestCampaign() {
            return this.questStore.quests.length || this.rewardStore.rewards.length;
        },
        navbarItems() {
            const items = [
                {
                    key: 'quests',
                    label: 'Quests',
                },
                {
                    key: 'rewards',
                    label: 'Rewards',
                },
                {
                    key: 'leaderboard',
                    label: 'Rank',
                },
                {
                    key: 'transactions',
                    label: 'Transactions',
                },
            ];

            if (this.accountStore.isMobile) {
                items.push({
                    key: 'wallet',
                    label: 'Wallet',
                });
            }

            return items;
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
    bottom: -5px;
    z-index: 22;
    background: var(--navbar-bottom-bg);
    backdrop-filter: blur(27px);
    left: 0;
    padding: 1rem;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
}

.navbar-bottom a {
    height: 50px;
    padding: 5px;
    flex-shrink: 0;
}

.navbar-item-label {
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
.navbar-icon {
    width: 24px;
    height: 24px;
    background-size: contain;
    background-repeat: no-repeat;
    display: inline-block;
}
.navbar-item.active {
    color: #ffffff !important;
    background: var(--navbar-bottom-selected-bg);
}

.navbar-item {
    color: var(--navbar-bottom-color) !important;
    background: var(--navbar-bottom-default-bg);
}
.navbar-item.active .navbar-icon {
    filter: brightness(0) invert(1);
}

.navbar-icon-quests {
    background-image: url('/src/assets/quest-light.png');
}
.navbar-icon-rewards {
    background-image: url('/src/assets/reward-light.png');
}
.navbar-icon-leaderboard {
    background-image: url('/src/assets/leader-light.png');
}
.navbar-icon-wallet {
    background-image: url('/src/assets/wallet-light.png');
}
.navbar-icon-transactions {
    background-image: url('/src/assets/transaction-light.png');
}

/* Dark Theme Icons */
[data-theme='dark'] .navbar-icon-quests {
    background-image: url('/src/assets/quest.png');
}
[data-theme='dark'] .navbar-icon-rewards {
    background-image: url('/src/assets/reward.png');
}
[data-theme='dark'] .navbar-icon-leaderboard {
    background-image: url('/src/assets/leader.png');
}
[data-theme='dark'] .navbar-icon-wallet {
    background-image: url('/src/assets/wallet.png');
}
[data-theme='dark'] .navbar-icon-transactions {
    background-image: url('/src/assets/transaction.png');
}
</style>

<template>
    <aside v-if="!accountStore.isMobile" class="d-flex flex-column justify-content-between p-3 h-100">
        <nav class="d-flex flex-column gap-3 fs-6 fw-normal">
            <a
                v-for="item in navItems"
                :key="item.name"
                href="#"
                class="text-decoration-none d-flex align-items-center gap-3 rounded-3 px-3 py-2 side-nav-item"
                :class="{ active: selectedPart === item.name }"
                @click.prevent="selectNavItem(item.name)"
            >
                <img :src="item.icon" :alt="item.label" width="16" height="16" />
                {{ item.label }}
            </a>
        </nav>
        <BaseCardDiscord />
    </aside>
</template>

<script>
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import imgQuests from '../../assets/quest.png';
import imgRewards from '../../assets/reward.png';
import imgLeaderboard from '../../assets/leader.png';
import imgWallet from '../../assets/wallet.png';
import imgTransactions from '../../assets/transaction.png';

export default defineComponent({
    name: 'Sidebar',
    props: {
        selectedPart: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            navItems: [
                { name: 'quests', label: 'Quests', icon: imgQuests },
                { name: 'rewards', label: 'Rewards', icon: imgRewards },
                { name: 'leaderboard', label: 'Leaderboard', icon: imgLeaderboard },
                { name: 'wallet', label: 'Wallet', icon: imgWallet },
                { name: 'transactions', label: 'Transactions', icon: imgTransactions },
            ],
        };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    methods: {
        selectNavItem(itemName) {
            this.$emit('nav-clicked', itemName);
        },
    },
});
</script>

<style scoped>
.side-nav-item {
    width: 167px;
    border: 0.5px solid #1d1d1d;
    background: rgba(27, 27, 27, 0.4);
    color: #cacaca;
    font-size: 12px;
    transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out;
}
.active {
    background-color: #d44646;
    font-weight: 600;
    border-color: transparent;
    color: #ffffff;
}
</style>

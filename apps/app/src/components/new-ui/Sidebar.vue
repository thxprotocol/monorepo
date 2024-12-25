<template>
    <aside
        v-if="!accountStore.isMobile"
        class="d-flex flex-column justify-content-between p-3 h-100 overflow-auto gap-4 sidebar-wrap"
    >
        <nav class="d-flex flex-column gap-3 fs-6 fw-normal">
            <a
                v-for="item in navItems"
                :key="item.name"
                href="#"
                class="text-decoration-none d-flex align-items-center gap-3 px-3 py-2 side-nav-item"
                :class="{ active: selectedPart === item.name }"
                @click.prevent="selectNavItem(item.name)"
            >
                <span :class="['sidebar-icon', `sidebar-icon-${item.name}`]" />
                {{ item.label }}
            </a>
        </nav>
        <div class="d-flex flex-column gap-2">
            <div class="cursor-pointer" @click.prevent="selectNavItem('rewards')">
                <img :src="aptosBanner" alt="Aptos Banner" height="380" width="182" />
            </div>
            <BaseCardDiscord />
        </div>
    </aside>
</template>

<script>
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useTrackPageview } from '@thxnetwork/app/utils/snowplowTracker';
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
                { name: 'quests', label: 'Quests' },
                { name: 'rewards', label: 'Rewards' },
                { name: 'leaderboard', label: 'Leaderboard' },
                { name: 'wallet', label: 'Wallet' },
                { name: 'transactions', label: 'Transactions' },
            ],
            aptosBanner: null,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    mounted() {
        useTrackPageview();
        import('../../assets/aptos-banner.png').then((module) => {
            this.aptosBanner = module.default;
        });
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
    border: 0.5px solid var(--btn-sidebar-border-color);
    background: var(--btn-sidebar-bg);
    color: var(--btn-sidebar-color);
    font-size: 12px;
    transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out,
        border-radius 0.15s ease-in-out;
    border-radius: 5px;
}
.active {
    background-color: var(--btn-sidebar-active-bg);
    font-weight: 600;
    border-color: transparent;
    color: #ffffff;
    border-radius: 8px;
}
.sidebar-wrap {
    min-width: 220px;
}
.sidebar-wrap::-webkit-scrollbar {
    display: none !important;
}
.side-nav-item.active .sidebar-icon {
    filter: brightness(0) invert(1);
}
.sidebar-icon {
    width: 16px;
    height: 16px;
    background-size: contain;
    background-repeat: no-repeat;
    display: inline-block;
}

[data-theme='dark'] .sidebar-icon-quests {
    background-image: url('/src/assets/quest.png');
}
[data-theme='dark'] .sidebar-icon-rewards {
    background-image: url('/src/assets/reward.png');
}
[data-theme='dark'] .sidebar-icon-leaderboard {
    background-image: url('/src/assets/leader.png');
}
[data-theme='dark'] .sidebar-icon-wallet {
    background-image: url('/src/assets/wallet.png');
}
[data-theme='dark'] .sidebar-icon-transactions {
    background-image: url('/src/assets/transaction.png');
}

.sidebar-icon-quests {
    background-image: url('/src/assets/quest-light.png');
}
.sidebar-icon-rewards {
    background-image: url('/src/assets/reward-light.png');
}
.sidebar-icon-leaderboard {
    background-image: url('/src/assets/leader-light.png');
}
.sidebar-icon-wallet {
    background-image: url('/src/assets/wallet-light.png');
}
.sidebar-icon-transactions {
    background-image: url('/src/assets/transaction-light.png');
}
</style>

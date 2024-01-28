<template>
    <div class="sidebar" v-if="isShown">
        <div class="sidebar-backdrop" @click.stop="onClickBackdrop"></div>
        <aside class="sidebar-panel h-100">
            <BaseCardAccount />
            <BaseCardRewards />
        </aside>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';

export default defineComponent({
    data() {
        return {
            screenWidth: window.innerWidth,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isShown() {
            if (!this.accountStore.isAuthenticated) return false;
            if (!this.accountStore.isMobile) return true;
            return this.accountStore.isSidebarShown;
        },
    },
    methods: {
        onClickBackdrop() {
            this.accountStore.isSidebarShown = false;
        },
    },
});
</script>
<style lang="scss">
.sidebar {
    .sidebar-panel {
        display: flex;
        flex-direction: column;
        width: 400px;
        max-width: 400px;
        background: var(--bs-body-bg);
        border-left: 3px solid var(--thx-navbar-bg);

        @media (max-width: 991px) {
            border: 0;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.75);
            width: 90%;
            overflow-y: auto;
        }
    }
}
</style>

<style>
.sidebar .tabs-rewards .tab-content {
    overflow-y: auto;
    max-height: calc(100vh - 191px);
}
</style>

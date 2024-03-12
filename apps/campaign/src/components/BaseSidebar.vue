<template>
    <aside class="sidebar" v-if="isShown">
        <div class="sidebar-panel h-100">
            <BaseCardAccount />
            <!-- <BaseCardWallets /> -->
            <BaseCardRewards />
        </div>
    </aside>
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
        scrollHeight() {
            const { windowHeight, isMobile } = this.accountStore;
            // Return null to disable custom scroller
            if (isMobile) return null;
            const mobileOffset = 30;
            const height = windowHeight - mobileOffset;
            return { height: `${height}px` };
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
        overflow-x: hidden;
        overflow-y: auto;

        @media (max-width: 991px) {
            border: 0;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.75);
            width: 90%;
        }
    }
}
</style>

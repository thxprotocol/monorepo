<template>
    <div class="sidebar" v-if="isShown">
        <div class="sidebar-backdrop" @click.stop="onClickBackdrop"></div>
        <aside class="sidebar-panel h-100">
            <BaseCardAccount />
            <BaseViewWallet />
            <footer class="d-flex px-3 py-2 mt-auto" v-if="accountStore.isMobile">
                <b-button @click="accountStore.isSidebarShown = false" class="text-white ms-auto btn-close">
                    <i class="fas fa-times" />
                </b-button>
            </footer>
        </aside>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseViewWallet from '../views/Wallet.vue';
import BaseCardAccount from '../components/card/BaseCardAccount.vue';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';

export default defineComponent({
    components: {
        BaseViewWallet,
        BaseCardAccount,
    },
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
    // CSS vars do not work in media queries
    // https://stackoverflow.com/a/47212942
    @media (max-width: 991px) {
        z-index: 99;
        display: flex;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;

        .sidebar-backdrop {
            display: flex;
            background: rgba(0, 0, 0, 0.5);
            flex-grow: 1;
        }
    }

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

            .btn-close {
                opacity: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                bottom: 1rem;
                right: 1rem;
                width: 40px;
                height: 40px;
                background: var(--bs-primary);
                border-radius: 40px;
                text-decoration: none;
            }
        }
    }
}
</style>

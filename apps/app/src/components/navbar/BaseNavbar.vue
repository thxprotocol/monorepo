<template>
    <b-navbar
        variant="primary"
        style="background: rgba(0, 0, 0, 0.35) !important"
        fluid
        toggleable="lg"
        type="dark"
        :container="true"
        class="navbar-menu py-1"
    >
        <b-navbar-brand href="#">
            <b-link to="/">
                <b-img :src="imgLogo" height="40" alt="" />
            </b-link>
        </b-navbar-brand>
        <b-collapse id="nav-collapse" is-nav>
            <b-button
                class="me-lg-3 mb-3 mb-lg-0 py-2 px-3 rounded text-decoration-none text-white"
                variant="link"
                to="/learn"
            >
                Learn
            </b-button>
            <b-button
                class="me-lg-3 mb-3 mb-lg-0 py-2 px-3 rounded text-decoration-none text-white"
                variant="link"
                to="/governance"
            >
                Governance
            </b-button>
            <b-button
                class="me-lg-3 mb-3 mb-lg-0 py-2 px-3 rounded text-decoration-none text-white"
                variant="link"
                to="/members"
            >
                Members
                <sup><i class="fas fa-circle text-danger" /></sup>
            </b-button>

            <b-button class="ps-4 pe-3 rounded py-2 ms-2" variant="primary" target="_blank" :href="dashboardURL">
                Create Campaign
                <i class="fas fa-plus ms-2 text-opaque" />
            </b-button>

            <b-navbar-nav
                v-if="!accountStore.isAuthenticated"
                class="ms-auto mb-2 mb-lg-0 justify-content-end align-items-center"
            >
                <b-button v-b-modal="'modalLogin'" class="px-4 ms-2 rounded py-2" variant="outline-light">
                    Sign up
                </b-button>
                <b-button v-b-modal="'modalLogin'" class="px-4 ms-2 rounded py-2" variant="primary">
                    Sign in
                    <i class="fas fa-sign-in-alt ms-2" />
                </b-button>
            </b-navbar-nav>
        </b-collapse>
        <div class="d-flex align-items-center">
            <BaseDropdownWallets v-if="accountStore.isAuthenticated" class="me-3" />
            <BaseDropdownUserMenu class="ms-auto" />
            <b-button variant="link" class="d-block d-lg-none" @click="isNavbarOffcanvasShown = true">
                <i class="fas fa-bars text-white"></i>
            </b-button>
        </div>
    </b-navbar>
    <b-offcanvas
        v-model="isNavbarOffcanvasShown"
        :no-header-close="true"
        placement="start"
        backdrop
        class="offcanvas"
        header-class="pt-4"
        body-class="p-3"
    >
        <template #title>
            <b-link to="/" class="d-flex align-items-center font-weight-bold text-decoration-none text-white">
                <b-img :src="imgLogo" height="30" alt="" class="me-3" />
                THX Network
            </b-link>
        </template>

        <b-list-group class="w-100 mb-4" style="border-radius: 0">
            <b-list-group-item class="d-flex" @click="onClickRoute('/learn')">
                <div style="width: 30px"><i class="fas fa-graduation-cap me-1 text-opaque"></i></div>
                Learn
            </b-list-group-item>
            <b-list-group-item class="d-flex" @click="onClickRoute('/governance')">
                <div style="width: 30px"><i class="fas fa-users me-1 text-opaque"></i></div>
                Governance
            </b-list-group-item>
            <b-list-group-item class="d-flex" @click="onClickRoute('/members')">
                <div style="width: 30px"><i class="fas fa-id-card me-1 text-opaque"></i></div>
                Members
                <sup><i class="fas fa-circle text-danger" /></sup>
            </b-list-group-item>
            <b-list-group-item
                class="d-flex"
                :disabled="!accountStore.isAuthenticated"
                @click="onClickRoute('/wallets')"
            >
                <div style="width: 30px"><i class="fas fa-wallet me-1 text-opaque"></i></div>
                Wallet
            </b-list-group-item>
        </b-list-group>

        <b-button class="ps-4 pe-3 rounded py-2 ms-2" variant="primary" target="_blank" :href="dashboardURL">
            Create Campaign
            <i class="fas fa-plus ms-2 text-opaque" />
        </b-button>
        <div class="text-center">
            <b-button
                v-if="!accountStore.isAuthenticated"
                v-b-modal="'modalLogin'"
                variant="link"
                class="text-white text-decoration-none text-opaque"
            >
                Sign in
                <i class="fas fa-sign-in-alt ml-auto"></i>
            </b-button>
            <b-button
                v-else
                variant="link"
                class="text-white text-decoration-none text-opaque"
                @click="accountStore.signout()"
            >
                Sign out
                <i class="fas fa-sign-out-alt ml-auto"></i>
            </b-button>
        </div>
    </b-offcanvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import imgLogo from '../../assets/logo.png';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { DASHBOARD_URL } from '@thxnetwork/app/config/secrets';

export default defineComponent({
    name: 'BaseNavbar',
    data() {
        return {
            isAlertTopShown: true,
            isNavbarOffcanvasShown: false,
            imgLogo,
            dashboardURL: DASHBOARD_URL,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
    },
    methods: {
        onClickRoute(path: string) {
            this.$router.push(path);
            this.isNavbarOffcanvasShown = false;
        },
    },
});
</script>

<style lang="scss">
.offcanvas {
    background: var(--bs-body-bg);
    border-right: 3px solid var(--thx-navbar-bg);
    overflow-x: hidden;
    overflow-y: auto;
    max-width: 90%;

    .offcanvas-body {
        display: flex;
        flex-direction: column;
    }
}
.navbar-menu .router-link-active.active {
    background: rgba(0, 0, 0, 0.4);
}
</style>

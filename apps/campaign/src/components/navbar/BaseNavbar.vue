<template>
    <b-navbar
        variant="primary"
        style="background: rgba(0, 0, 0, 0.35) !important"
        fluid
        toggleable="lg"
        type="dark"
        :container="true"
        class="px-3 py-1"
    >
        <b-navbar-brand href="#">
            <b-link to="/">
                <b-img :src="imgLogo" height="50" alt="" />
            </b-link>
        </b-navbar-brand>
        <BaseDropdownWallets v-if="accountStore.isAuthenticated" class="d-block d-lg-none ms-auto" />
        <b-button variant="link" class="d-block d-lg-none" @click="isNavbarOffcanvasShown = true">
            <i class="fas fa-bars text-white"></i>
        </b-button>
        <b-collapse id="nav-collapse" is-nav>
            <b-button
                class="me-lg-3 mb-3 mb-lg-0 py-2 px-4 rounded text-decoration-none text-white"
                variant="link"
                to="/learn"
            >
                Learn
            </b-button>
            <b-button
                class="me-lg-3 mb-3 mb-lg-0 py-2 px-4 rounded text-decoration-none text-white"
                variant="link"
                to="/earn"
            >
                Earn
            </b-button>
            <b-button
                class="me-lg-3 mb-3 mb-lg-0 py-2 px-4 rounded text-decoration-none text-white"
                variant="link"
                to="/community"
            >
                Community
            </b-button>
            <b-button
                class="me-lg-3 mb-3 mb-lg-0 py-2 px-4 rounded text-decoration-none text-white"
                variant="link"
                to="/members"
            >
                Members
                <sup><i class="fas fa-circle text-danger" /></sup>
            </b-button>
            <b-navbar-nav class="ms-auto mb-2 mb-lg-0 justify-content-end align-items-center">
                <b-button
                    v-if="accountStore.isMobile"
                    class="me-lg-3 mb-3 mb-lg-0 py-2 px-4 rounded"
                    variant="outline-light"
                    to="/wallets"
                >
                    <i class="fas fa-wallet me-1"></i>
                    Wallet
                </b-button>
                <template v-if="!authStore.user">
                    <b-button v-b-modal="'modalLogin'" class="px-4 ms-2 rounded py-2" variant="outline-light">
                        Sign up
                    </b-button>
                    <b-button v-b-modal="'modalLogin'" class="px-4 ms-2 rounded py-2" variant="primary">
                        Sign in
                        <i class="fas fa-sign-in-alt ms-2" />
                    </b-button>
                </template>
                <template v-else>
                    <b-button class="px-4 rounded py-2 ms-2" variant="primary" @click="accountStore.signout()">
                        Sign out
                        <i class="fas fa-sign-out-alt ms-2"></i>
                    </b-button>
                </template>
            </b-navbar-nav>
        </b-collapse>
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
        <BaseCardAccount v-if="accountStore.isAuthenticated" />
        <b-list-group class="w-100 mb-4" style="border-radius: 0">
            <b-list-group-item class="d-flex" @click="onClickRoute('/')">
                <div style="width: 30px"><i class="fas fa-home me-1 text-opaque"></i></div>
                Explore
            </b-list-group-item>
            <b-list-group-item class="d-flex" @click="onClickRoute('/learn')">
                <div style="width: 30px"><i class="fas fa-graduation-cap me-1 text-opaque"></i></div>
                Learn
            </b-list-group-item>
            <b-list-group-item class="d-flex" @click="onClickRoute('/earn')">
                <div style="width: 30px"><i class="fas fa-rocket me-1 text-opaque"></i></div>
                Earn
            </b-list-group-item>
            <b-list-group-item class="d-flex" @click="onClickRoute('/community')">
                <div style="width: 30px"><i class="fas fa-users me-1 text-opaque"></i></div>
                Community
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
                My Rewards
            </b-list-group-item>
        </b-list-group>
        <b-button v-if="!accountStore.isAuthenticated" v-b-modal="'modalLogin'" variant="primary">
            Sign in
            <i class="fas fa-sign-in-alt ml-auto"></i>
        </b-button>
        <b-button v-else variant="primary" @click="accountStore.signout()">
            Sign out
            <i class="fas fa-sign-out-alt ml-auto"></i>
        </b-button>
    </b-offcanvas>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import imgLogo from '../../assets/logo.png';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';

export default defineComponent({
    name: 'BaseNavbar',
    data() {
        return {
            isAlertTopShown: true,
            isNavbarOffcanvasShown: false,
            imgLogo,
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
</style>

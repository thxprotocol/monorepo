<template>
    <div
        :style="{
            minHeight: '100%',
            backgroundSize: 'cover',
            backgroundImage: `url(${imgBgOverlay})`,
        }"
        class="pt-3"
    >
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
            <hr />
            <b-list-group class="w-100" style="border-radius: 0">
                <b-list-group-item @click="onClickRoute('/')"
                    ><i class="fas fa-home me-1"></i> Discovery
                </b-list-group-item>
                <b-list-group-item @click="onClickRoute('/learn')">
                    <i class="fas fa-graduation-cap me-1"></i> Learn
                </b-list-group-item>
                <b-list-group-item @click="onClickRoute('/earn')">
                    <i class="fas fa-rocket me-1"></i> Earn
                </b-list-group-item>
                <b-list-group-item @click="onClickRoute('/wallets')">
                    <i class="fas fa-wallet me-1"></i>
                    Wallet
                </b-list-group-item>
            </b-list-group>
            <hr />
            <b-button v-if="!accountStore.isAuthenticated" v-b-modal="'modalLogin'" variant="primary">
                Sign in
                <i class="fas fa-sign-in-alt ml-auto"></i>
            </b-button>
            <b-button v-else variant="primary" @click="accountStore.signout()">
                Sign out
                <i class="fas fa-sign-out-alt ml-auto"></i>
            </b-button>
        </b-offcanvas>
        <b-container>
            <b-navbar toggleable="lg" type="dark" :container="true">
                <b-navbar-brand href="#" style="width: 120px">
                    <b-link to="/">
                        <b-img :src="imgLogo" height="50" alt="" />
                    </b-link>
                </b-navbar-brand>
                <BaseDropdownWallets class="d-block d-lg-none ms-auto" />
                <b-button variant="link" class="d-block d-lg-none" @click="isNavbarOffcanvasShown = true">
                    <i class="fas fa-bars text-white"></i>
                </b-button>
                <b-collapse id="nav-collapse" is-nav class="pt-3">
                    <b-navbar-nav class="ms-auto">
                        <b-button
                            class="me-lg-3 mb-3 mb-lg-0 px-4"
                            variant="outline-light"
                            href="https://docs.thx.network"
                            target="_blank"
                        >
                            <i class="fas fa-graduation-cap me-1"></i>
                            Learn
                        </b-button>
                        <b-button class="me-lg-3 mb-3 mb-lg-0 px-4" variant="outline-light" to="/earn">
                            <i class="fas fa-rocket me-1"></i>
                            Earn
                        </b-button>
                        <b-button
                            v-if="accountStore.isMobile"
                            class="me-lg-3 mb-3 mb-lg-0 px-4"
                            variant="outline-light"
                            to="/wallets"
                        >
                            <i class="fas fa-wallet me-1"></i>
                            Wallet
                        </b-button>
                    </b-navbar-nav>
                    <b-navbar-nav class="ms-auto mb-2 mb-lg-0 justify-content-end align-items-center">
                        <template v-if="!authStore.user">
                            <b-button v-b-modal="'modalLogin'" class="px-4 text-white" variant="link">
                                <!-- Sign in -->
                                <i class="fas fa-sign-in-alt ms-2" />
                            </b-button>
                        </template>
                        <template v-else>
                            <BaseDropdownWallets />
                            <b-button class="px-4 text-white" variant="link" @click="accountStore.signout()">
                                <!-- Sign out -->
                                <i class="fas fa-sign-out-alt ml-auto"></i>
                            </b-button>
                        </template>
                    </b-navbar-nav>
                </b-collapse>
            </b-navbar>
        </b-container>
        <router-view />
        <BaseFooter />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import imgLogo from '../assets/logo.png';
import imgBgOverlay from '../assets/bg-overlay.png';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';
import { useAuthStore } from '../stores/Auth';
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'ViewDiscovery',
    data() {
        return {
            isNavbarOffcanvasShown: false,
            isModalConnectSettingsShown: false,
            isModalAccountShown: false,
            imgLogo,
            imgBgOverlay,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
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

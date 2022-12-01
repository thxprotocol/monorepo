<template>
    <div class="d-flex flex-column h-100">
        <b-navbar type="dark" variant="dark" class="navbar-top pt-3">
            <b-button variant="link" @click="onClick()"> <i class="fas fa-times text-white"></i></b-button>
            <b-button
                variant="link"
                v-if="!accountStore.isAuthenticated"
                @click="accountStore.api.signin()"
                class="text-white"
            >
                Signin <i class="fas fa-sign-in-alt ml-1"></i>
            </b-button>
            <b-dropdown variant="link" v-else no-caret right>
                <template #button-content>
                    <i class="fas fa-bars text-white"></i>
                </template>
                <b-dropdown-item-button disabled size="sm" @click="accountStore.api.signin()">
                    Account
                </b-dropdown-item-button>
                <b-dropdown-item-button size="sm" @click="accountStore.api.signout()">Signout</b-dropdown-item-button>
            </b-dropdown>
        </b-navbar>
        <div class="flex-grow-1 overflow-auto">
            <router-view />
        </div>
        <b-navbar variant="dark" class="navbar-bottom">
            <router-link to="/" class="d-flex flex-column justify-content-center align-items-center">
                <i class="fas fa-coins"></i>
                Points
            </router-link>
            <router-link to="/perks" class="d-flex flex-column justify-content-center align-items-center">
                <i class="fas fa-store"></i>
                Store
            </router-link>
            <router-link to="/wallet" class="d-flex flex-column justify-content-center align-items-center">
                <i class="fas fa-user"></i>
                Wallet
            </router-link>
        </b-navbar>
    </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useAccountStore } from './stores/Account';

export default defineComponent({
    methods: {
        onClick: () => {
            // TODO Figure out how to get the parent window location href here. Probably by searching for pool or by adding the location the the iframe source. We will need to cache it locally though to make sure things go well after sigin (or pass it in the OIDC state)
            window.top?.postMessage('thx.close', 'https://localhost:8081');
        },
    },
    computed: {
        ...mapStores(useAccountStore),
    },
});
</script>

<style lang="scss">
html,
body,
#app {
    height: 100%;
}
.navbar-top .btn {
    transition: transform ease 0.2s;
    &:hover {
        transform: scale(1.2);
    }
}
.navbar.bg-dark {
    padding: 0.5rem;
    border-top: 1px solid #31236d;
    background-color: #241956 !important;

    .container-fluid {
        padding: 0;
    }

    a {
        margin: 0;
        line-height: 1;
        width: 70px;
        height: 70px;
        align-items: center;
        justify-content: center;
        display: flex;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-size: 0.9rem;

        i {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
            opacity: 0.5;
            transition: opacity ease 0.2s, transform ease 0.2s;
        }

        &:hover i {
            transform: scale(1.1);
            opacity: 1;
        }

        &.router-link-active {
            background-color: #31236d;
        }
    }
}
</style>

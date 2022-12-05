<template>
    <div class="d-flex flex-column h-100">
        <b-navbar class="navbar-top pt-3" :style="`background-image: url(${require('./assets/bg-planet.png')})`">
            <b-button variant="link" @click="onClickClose"> <i class="fas fa-times text-white"></i></b-button>
            <b-button
                variant="link"
                v-if="!accountStore.isAuthenticated"
                @click="accountStore.api.signin()"
                class="text-white"
            >
                Sign in
            </b-button>
            <b-dropdown variant="link" v-else no-caret right>
                <template #button-content>
                    <i class="fas fa-bars text-white"></i>
                </template>
                <b-dropdown-item-button size="sm" @click="onClickAccount"> Account </b-dropdown-item-button>
                <b-dropdown-item-button size="sm" @click="accountStore.api.signout()">Signout</b-dropdown-item-button>
            </b-dropdown>
        </b-navbar>
        <div class="flex-grow-1 overflow-auto">
            <router-view />
        </div>
        <b-navbar class="navbar-bottom">
            <router-link to="/" class="d-flex flex-column justify-content-center align-items-center">
                <i class="fas fa-coins"></i>
                Points
            </router-link>
            <router-link to="/perks" class="d-flex flex-column justify-content-center align-items-center">
                <i class="fas fa-store"></i>
                Perks
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
    computed: {
        ...mapStores(useAccountStore),
    },
    mounted() {
        // this.accountStore.api.userManager.cached.signinPopupCallback();
    },
    methods: {
        onClickClose() {
            const origin = this.accountStore.config().origin;
            window.top?.postMessage('thx.close', origin);
        },
        onClickAccount() {
            this.accountStore.api.userManager.cached.signinRedirect({
                extraQueryParams: {
                    prompt: 'account-settings',
                    return_url: window.location.href,
                },
            });
        },
    },
});
</script>
<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Exo+2:200,400,400i,700,700i,900,900i');

@import '~bootstrap/scss/functions';
@import './scss/variables';
@import '~bootstrap/scss/maps';
@import '~bootstrap/scss/mixins';
@import '~bootstrap/scss/utilities';

@import '~bootstrap/scss/root';
@import '~bootstrap/scss/reboot';
@import '~bootstrap/scss/type';
@import '~bootstrap/scss/images';
@import '~bootstrap/scss/containers';
@import '~bootstrap/scss/grid';
@import '~bootstrap/scss/tables';
@import '~bootstrap/scss/forms';
@import '~bootstrap/scss/buttons';
@import '~bootstrap/scss/transitions';
@import '~bootstrap/scss/dropdown';
@import '~bootstrap/scss/button-group';
@import '~bootstrap/scss/nav';
@import '~bootstrap/scss/navbar';
@import '~bootstrap/scss/card';
@import '~bootstrap/scss/accordion';
@import '~bootstrap/scss/breadcrumb';
@import '~bootstrap/scss/pagination';
@import '~bootstrap/scss/badge';
@import '~bootstrap/scss/alert';
@import '~bootstrap/scss/progress';
@import '~bootstrap/scss/list-group';
@import '~bootstrap/scss/close';
@import '~bootstrap/scss/toasts';
@import '~bootstrap/scss/modal';
@import '~bootstrap/scss/tooltip';
@import '~bootstrap/scss/popover';
@import '~bootstrap/scss/carousel';
@import '~bootstrap/scss/spinners';
@import '~bootstrap/scss/offcanvas';
@import '~bootstrap/scss/placeholders';

// Helpers
@import '~bootstrap/scss/helpers';

// Utilities
@import '~bootstrap/scss/utilities/api';
// scss-docs-end import-stack

// Bootstrap Vue
@import '~bootstrap-vue-3/dist/bootstrap-vue-3.css';

html,
body,
#app {
    height: 100%;
}

blockquote {
    border-left: 3px solid $purple;
    background-color: $purple-darker;
    padding: 0.5rem;

    a {
        transition: color 0.2s ease;

        &:hover {
            color: white !important;
        }
    }
}

.navbar-top {
    background-position: center -50px;
    background-repeat: no-repeat;

    .btn {
        transition: opacity ease 0.2s;
        opacity: 0.8;

        &:hover {
            opacity: 1;
        }
    }
}

.navbar-bottom {
    padding: 0.5rem;
    border-top: 1px solid $purple-dark;

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
            background-color: $purple-dark;
        }
    }
}
</style>

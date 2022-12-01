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
                <b-dropdown-item-button @click="accountStore.api.signout()">Signout</b-dropdown-item-button>
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
import { useRewardStore } from './stores/Reward';

export default defineComponent({
    methods: {
        onClick: () => {
            window.top?.postMessage('thx.close', 'https://localhost:8081');
        },
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
    },
    created: async function () {
        const poolId = this.$route.query.id as string;
        this.accountStore.init(poolId).then(() => {
            this.accountStore.getBalance();
            this.rewardsStore.list();
        });
    },
});
</script>

<style lang="scss">
html,
body,
#app {
    height: 100%;
}
</style>

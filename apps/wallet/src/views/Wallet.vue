<template>
    <b-container>
        <b-row>
            <b-navbar fluid class="mb-3">
                <b-navbar-brand to="/">
                    <b-img :src="imgLogo" width="40" />
                </b-navbar-brand>
                <b-navbar-toggle target="nav-collapse" />
                <b-button
                    v-if="!authStore.isAuthenticated"
                    variant="primary"
                    size="sm"
                    @click="authStore.isModalLoginShown = true"
                >
                    Log in
                    <BaseIcon icon="sign-in-alt" class="ms-2" />
                </b-button>
                <b-nav-item-dropdown v-else end no-caret class="d-flex">
                    <template #button-content>
                        <b-avatar
                            size="40"
                            variant="dark"
                            :src="accountStore.account ? accountStore.account.profileImg : ''"
                            :text="accountStore.account ? accountStore.account.username.substring(0, 2) : '..'"
                        />
                    </template>
                    <b-dropdown-item @click="accountStore.isModalAccountShown = true">Account</b-dropdown-item>
                    <b-dropdown-item to="/logout">Logout</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar>
        </b-row>
        <router-view />
        <BaseModalLogin />
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore, useAuthStore } from '@thxnetwork/wallet/stores';
import imgLogo from '@thxnetwork/wallet/assets/logo.jpg';

export default defineComponent({
    name: 'ViewWallet',
    data() {
        return {
            imgLogo,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
    },
});
</script>

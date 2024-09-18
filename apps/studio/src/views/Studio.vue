<template>
    <b-container>
        <b-row>
            <b-navbar>
                <b-navbar-brand to="/">
                    <b-img :src="imgLogo" width="50" class="rounded" />
                </b-navbar-brand>
                <b-navbar-toggle target="nav-collapse" />
                <b-collapse id="nav-collapse" is-nav>
                    <b-navbar-nav>
                        <b-nav-item to="/collections">Collections</b-nav-item>
                        <b-nav-item to="/qr-codes">QR Codes</b-nav-item>
                    </b-navbar-nav>
                </b-collapse>
                <b-navbar-nav class="me-3">
                    <b-nav-item href="https://www.twinstory.io" target="_blank">FAQ</b-nav-item>
                    <b-nav-item href="https://www.twinstory.io" target="_blank">Support</b-nav-item>
                </b-navbar-nav>
                <b-nav-item-dropdown right no-caret class="d-flex">
                    <template #button-content>
                        <b-avatar
                            size="40"
                            variant="dark"
                            :src="accountStore.account ? accountStore.account.profileImg : undefined"
                            :text="accountStore.account ? accountStore.account.username.substring(0, 2) : '..'"
                        />
                    </template>
                    <b-dropdown-item to="/account">Account</b-dropdown-item>
                    <b-dropdown-item to="/logout">Logout</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar>
        </b-row>
    </b-container>
    <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '@thxnetwork/studio/stores';
import imgLogo from '@thxnetwork/studio/assets/logo.jpg';

export default defineComponent({
    name: 'Home',
    data() {
        return {
            imgLogo,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    mounted() {
        this.accountStore.get();
    },
});
</script>

<template>
    <b-container>
        <b-row>
            <b-navbar toggleable="lg">
                <b-navbar-brand to="/">
                    <b-img :src="imgLogoLight" height="40" />
                </b-navbar-brand>
                <b-collapse id="nav-collapse" is-nav class="order-1 order-md-0">
                    <b-navbar-nav>
                        <b-nav-item class="mx-lg-3" to="/collections">My Collections</b-nav-item>
                        <b-nav-item class="mx-lg-3" to="/qr-codes">Usage</b-nav-item>
                    </b-navbar-nav>
                    <b-navbar-nav class="ms-auto me-3">
                        <b-nav-item class="mx-lg-3" href="https://www.twinstory.io/faq" target="_blank">FAQ</b-nav-item>
                        <b-nav-item class="mx-lg-3" href="https://www.twinstory.io/support" target="_blank">
                            Support
                        </b-nav-item>
                    </b-navbar-nav>
                </b-collapse>
                <b-navbar-toggle target="nav-collapse" class="ms-auto me-2 border-0">
                    <BaseIcon icon="bars" />
                </b-navbar-toggle>
                <b-nav-item-dropdown end no-caret class="d-flex">
                    <template #button-content>
                        <b-avatar
                            size="40"
                            variant="dark"
                            :src="accountStore.account ? accountStore.account.profileImg : ''"
                            :text="accountStore.account ? accountStore.account.username.substring(0, 2) : '..'"
                        />
                    </template>
                    <b-dropdown-item to="/account">Account</b-dropdown-item>
                    <b-dropdown-item to="/settings">Settings</b-dropdown-item>
                    <b-dropdown-item to="/logout">Logout</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar>
        </b-row>
    </b-container>
    <router-view />
</template>

<script lang="ts">
import imgLogoLight from '@thxnetwork/studio/assets/logo-light.png';
import { useAccountStore } from '@thxnetwork/studio/stores';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Home',
    data() {
        return {
            imgLogoLight,
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

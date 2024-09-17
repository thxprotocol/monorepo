<template>
    <b-container>
        <b-row>
            <b-navbar>
                <b-navbar-brand href="/">
                    <b-img :src="imgLogo" width="50" class="rounded" />
                </b-navbar-brand>
                <b-navbar-toggle target="nav-collapse" />
                <b-collapse id="nav-collapse" is-nav>
                    <b-navbar-nav>
                        <b-nav-item to="/collections">Collections</b-nav-item>
                        <b-nav-item to="/qr-codes">QR Codes</b-nav-item>
                    </b-navbar-nav>
                </b-collapse>
                <b-nav-item-dropdown right no-caret class="d-flex">
                    <template #button-content>
                        <BAvatar variant="dark" text="BV" />
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
import imgLogo from '@thxnetwork/studio/assets/logo.jpg';

export default defineComponent({
    name: 'Home',
    data() {
        return {
            imgLogo,
        };
    },
});
</script>

<template>
    <div>
        <b-container>
            <b-navbar toggleable="lg" type="dark" class="mt-3" :container="false">
                <b-navbar-brand href="#" style="width: 120px">
                    <b-link to="/">
                        <b-img :src="imgLogo" height="50" alt="" />
                    </b-link>
                </b-navbar-brand>
                <b-navbar-toggle target="nav-collapse" />
                <b-collapse id="nav-collapse" is-nav>
                    <b-navbar-nav class="ms-auto">
                        <b-button class="me-lg-3 mb-3 mb-lg-0 px-4" variant="outline-light" to="/learn">
                            <i class="fas fa-graduation-cap me-1"></i>
                            Learn
                        </b-button>
                        <b-button class="me-lg-3 mb-3 mb-lg-0 px-4" variant="outline-light" to="/earn">
                            <i class="fas fa-rocket me-1"></i>
                            Earn
                        </b-button>
                    </b-navbar-nav>
                    <b-navbar-nav class="ms-auto mb-2 mb-lg-0" style="width: 120px">
                        <b-button
                            class="px-4"
                            variant="primary"
                            href="#"
                            v-if="!accountStore.isAuthenticated"
                            @click="accountStore.signin()"
                        >
                            Sign in
                            <i class="fas fa-sign-in-alt ms-2" />
                        </b-button>
                        <b-nav-item-dropdown v-else right>
                            <template #button-content> User </template>
                            <BDropdownItem href="#">Profile</BDropdownItem>
                            <BDropdownItem href="#">Sign Out</BDropdownItem>
                        </b-nav-item-dropdown>
                    </b-navbar-nav>
                </b-collapse>
            </b-navbar>
        </b-container>
    </div>
    <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseNavbarSecondary from '../components/BaseNavbarSecondary.vue';
import imgLogo from '../assets/logo.png';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';

export default defineComponent({
    name: 'Public',
    components: {
        BaseNavbarSecondary,
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    data() {
        return { imgLogo };
    },
});
</script>

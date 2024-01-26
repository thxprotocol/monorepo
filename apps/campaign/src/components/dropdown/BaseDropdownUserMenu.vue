<template>
    <b-button v-if="!accountStore.isAuthenticated" @click="onClickSignin" variant="link">
        <b-spinner v-if="accountStore.isAuthenticated === false" small />
        <template v-else>Sign in</template>
    </b-button>
    <b-dropdown v-else variant="link" no-caret end>
        <template #button-content>
            <i class="fas fa-ellipsis-v"></i>
        </template>
        <b-dropdown-item @click="accountStore.isModalAccountShown = true"> Account </b-dropdown-item>
        <b-dropdown-item @click="accountStore.isModalWalletShown = true"> Wallets </b-dropdown-item>
        <b-dropdown-item
            v-if="questStore.quests.length"
            size="sm"
            @click="$router.push(`/c/${accountStore.config.slug}/w`)"
        >
            Identities
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item @click="$router.push(`/c/${accountStore.config.slug}/about`)"> About </b-dropdown-item>
        <b-dropdown-item-button @click="onClickSupport"> Support </b-dropdown-item-button>
        <b-dropdown-divider />
        <b-dropdown-item
            size="sm"
            @click="onClickSignout"
            link-class="d-flex align-items-center justify-content-between"
        >
            Sign out
            <i class="fas fa-sign-out-alt ml-auto"></i>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useQuestStore } from '../../stores/Quest';

export default defineComponent({
    name: 'BaseDropdownUserMenu',
    data() {
        return {
            //
        };
    },
    computed: {
        ...mapStores(useAuthStore),
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
    },
    methods: {
        onClickWallet() {
            this.$router.push(`/c/${this.accountStore.config.slug}/wallet`);
        },
        async onClickSignin() {
            this.accountStore.signin();
        },
        onClickSignout() {
            this.accountStore.signout();
        },
        onClickSupport() {
            window.open('https://discord.com/invite/TzbbSmkE7Y', '_blank');
        },
    },
});
</script>

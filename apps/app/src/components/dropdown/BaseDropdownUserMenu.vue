<template>
    <b-dropdown v-if="accountStore.account" variant="link" toggle-class="p-0" no-caret end>
        <template #button-content>
            <div :style="{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }" class="p-1 rounded-circle">
                <b-avatar size="35" :src="accountStore.account.profileImg" variant="dark" />
            </div>
        </template>
        <b-dropdown-item @click="accountStore.isModalAccountShown = true"> Account </b-dropdown-item>
        <template v-if="accountStore.config.slug">
            <b-dropdown-item size="sm" @click="$router.push(`/c/${accountStore.config.slug}/w`)">
                Identities
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item @click="$router.push(`/c/${accountStore.config.slug}/about`)"> About </b-dropdown-item>
        </template>
        <b-dropdown-item href="https://discord.com/invite/thx-network-836147176270856243" target="_blank">
            Support
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item
            size="sm"
            link-class="d-flex align-items-center justify-content-between"
            @click="onClickSignout"
        >
            Sign out
            <i class="fas fa-sign-out-alt ml-auto" />
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
    computed: {
        ...mapStores(useAuthStore, useAccountStore, useQuestStore),
    },
    methods: {
        onClickSignout() {
            this.accountStore.signout();
        },
        onClickSupport() {
            window.open('', '_blank');
        },
    },
});
</script>

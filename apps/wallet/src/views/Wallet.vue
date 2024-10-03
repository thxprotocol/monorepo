<template>
    <b-container>
        <b-row>
            <b-navbar fluid class="mb-3">
                <b-navbar-brand :to="`/${accountStore.settings?._id}`">
                    <b-img :src="accountStore.settings?.logoImgURL || imgLogoLightSquare" width="40" />
                </b-navbar-brand>
                <b-button
                    v-if="!authStore.isAuthenticated"
                    variant="primary"
                    size="sm"
                    @click="authStore.isModalLoginShown = true"
                >
                    Log in
                    <BaseIcon icon="sign-in-alt" class="ms-2" />
                </b-button>
                <template v-else>
                    <BaseDropdownWallets />
                    <b-nav-item-dropdown end no-caret class="d-flex">
                        <template #button-content>
                            <b-avatar
                                size="40"
                                variant="dark"
                                :src="accountStore.account ? accountStore.account.profileImg : ''"
                                :text="accountStore.account ? accountStore.account.username.substring(0, 2) : '..'"
                            />
                        </template>
                        <b-dropdown-item :to="`/${accountStore.settings?._id}/logout`">Logout</b-dropdown-item>
                    </b-nav-item-dropdown>
                </template>
            </b-navbar>
        </b-row>
        <div class="pb-3">
            <router-view />
        </div>
        <BaseModalLogin />
        <BaseModalWalletCreate size="lg" />
        <BaseModalWalletRecovery size="lg" />
    </b-container>
</template>

<script lang="ts">
import imgLogoLightSquare from '@thxnetwork/wallet/assets/logo-light-square.png';
import { useAccountStore, useAuthStore } from '@thxnetwork/wallet/stores';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ViewWallet',
    data() {
        return {
            imgLogoLightSquare,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
    },
});
</script>

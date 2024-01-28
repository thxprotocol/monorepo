<template>
    <b-container>
        <b-row>
            <b-col offset-xl="2" xl="8">
                <b-card class="mx-auto my-2" :img-src="accountStore.config.backgroundUrl" img-top>
                    <template #header>
                        <strong>{{ accountStore.config.title }}</strong>
                    </template>
                    <p style="white-space: pre-line" v-html="accountStore.config.description"></p>
                    <template #footer v-if="isWalletButtonShown">
                        <b-button @click="accountStore.isSidebarShown = true" variant="primary" class="w-100">
                            Show Wallet
                            <i class="fas fa-chevron-right ms-2" />
                        </b-button>
                    </template>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Identities',
    data() {
        return {
            uuid: '',
            error: '',
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isWalletButtonShown() {
            return this.accountStore.isAuthenticated;
        },
    },
});
</script>

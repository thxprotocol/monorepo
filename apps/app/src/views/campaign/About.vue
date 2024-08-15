<template>
    <b-container>
        <b-row>
            <b-col offset-xl="2" xl="8">
                <b-card class="mx-auto my-2" :img-src="accountStore.config.backgroundUrl" img-top>
                    <template #header>
                        <strong>{{ decodeHTML(accountStore.config.title) }}</strong>
                    </template>
                    <p style="white-space: pre-line" v-html="decodeHTML(accountStore.config.description)" />
                    <b-button
                        v-if="accountStore.isAuthenticated && accountStore.config.isQRCodeCampaign"
                        :to="`/c/${accountStore.config.slug}/wallets`"
                        variant="primary"
                        class="w-100"
                    >
                        Wallet
                        <i class="fas fa-chevron-right ms-2" />
                    </b-button>
                    <b-button
                        v-if="!accountStore.isAuthenticated && accountStore.config.isQRCodeCampaign"
                        variant="primary"
                        class="w-100"
                        @click="authStore.isModalLoginShown = true"
                    >
                        Sign in
                        <i class="fas fa-sign-in-alt ms-2" />
                    </b-button>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useRewardStore } from '../../stores/Reward';
import { useQuestStore } from '../../stores/Quest';
import { useAuthStore } from '../../stores/Auth';
import { decodeHTML } from '../../utils/decode-html';

export default defineComponent({
    name: 'Identities',
    data() {
        return {
            uuid: '',
            error: '',
            isLoading: false,
            decodeHTML,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        ...mapStores(useRewardStore),
    },
});
</script>

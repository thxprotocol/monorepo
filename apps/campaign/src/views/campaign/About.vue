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
import { useAuthStore } from '../../stores/Auth';
import { useWalletStore } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';
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
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        ...mapStores(useWalletStore),
        isWalletButtonShown() {
            return this.accountStore.isAuthenticated;
        },
    },
    mounted() {
        this.uuid = this.$route.params.uuid as string;
    },
    methods: {
        async onClickCollect() {
            this.isLoading = true;
            try {
                await this.accountStore.api.request.patch(`/v1/identity/${this.uuid}`);
                await this.questStore.list();
                this.$router.push(`/c/${this.accountStore.config.slug}/quests`);
            } catch (res) {
                this.error = (res as any).error.message || 'Something went wrong..';
            } finally {
                this.isLoading = false;
            }
        },
        async onClickSignin() {
            this.accountStore.signin();
        },
    },
});
</script>

<template>
    <b-container>
        <b-row>
            <b-col lg="6" offset-xl="3">
                <b-card class="mx-auto my-2">
                    <template #header>
                        <i class="fas fa-id-badge me-2" />
                        <strong>THX ID</strong>
                    </template>

                    <b-alert v-model="isAlertDangerShown" variant="danger" class="p-2">
                        <i class="fas fa-exclamation-circle mx-1" />
                        {{ error }}
                    </b-alert>

                    <b-form-group
                        label="Identity code"
                        description="Identity codes are used for connecting account in other apps."
                    >
                        <b-form-input v-model="uuid" :state="isValidUUID" placeholder="Code" />
                    </b-form-group>

                    <b-button
                        v-if="accountStore.isAuthenticated"
                        variant="success"
                        class="w-100"
                        :disabled="!!error || isWaitingForWalletAddress || isLoading || !isValidUUID"
                        @click="onClickConnect"
                    >
                        <b-spinner v-if="isLoading" small variant="dark" />
                        Connect Identity
                    </b-button>
                    <b-button v-else variant="primary" class="w-100" @click="authStore.isModalLoginShown = true">
                        Sign in &amp; Connect
                    </b-button>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useWalletStore } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';

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
        isWaitingForWalletAddress() {
            const { wallet } = useWalletStore();
            return !wallet || !wallet.address;
        },
        isValidUUID() {
            if (!this.uuid) return null;
            try {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return uuidRegex.test(this.uuid);
            } catch (error) {
                return null;
            }
        },
        isAlertDangerShown() {
            return !!this.error;
        },
    },
    mounted() {
        this.uuid = this.$route.params.uuid as string;
    },
    methods: {
        async onClickConnect() {
            this.isLoading = true;
            try {
                await this.accountStore.api.request.patch(`/v1/identity/${this.uuid}`);
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

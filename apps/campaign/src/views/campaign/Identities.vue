<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1">
        <b-row>
            <b-col offset-xl="1" xl="6">
                <b-card class="mx-auto my-2">
                    <template #header>
                        <i class="fas fa-id-badge me-2" />
                        <strong>THX ID</strong>
                    </template>

                    <b-form-group
                        label="Identity code"
                        description="Provide a valid identity code and connect it with your account."
                    >
                        <b-form-input :state="isValidUUID" v-model="uuid" placeholder="Code" />
                    </b-form-group>

                    <b-button
                        v-if="authStore.oAuthShare"
                        @click="onClickCollect"
                        variant="success"
                        class="w-100"
                        :disabled="!!error || isWaitingForWalletAddress || isLoading"
                    >
                        <b-spinner v-if="isLoading" small variant="dark" />
                        Connect Identity
                    </b-button>
                    <b-button v-else @click="onClickSignin" variant="primary" class="w-100">
                        Sign in &amp; Collect
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
import { useRewardStore } from '../../stores/Reward';

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
        ...mapStores(useRewardStore),
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
        isAlertInfoShown() {
            return !!this.walletStore.pendingPoints;
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
                await this.rewardsStore.list();
                this.$router.push(`/c/${this.accountStore.config.slug}/quests`);
            } catch (error) {
                this.error = (error as Error).message || 'Something went wrong..';
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

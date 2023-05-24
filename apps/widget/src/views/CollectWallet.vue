<template>
    <div class="d-flex flex-grow-1 justify-content-center flex-column align-items-center overflow-auto">
        <b-card class="m-2 w-75">
            <b-alert v-if="!accountStore.isAuthenticated" variant="info" show class="p-2">
                <i class="fas fa-gift me-1"></i>
                Sign in and collect <strong>{{ walletStore.pendingPoints }}</strong> points!
            </b-alert>

            <template v-else>
                <BaseAlertWalletAddress />
                <b-alert variant="info" show class="p-2" v-if="walletStore.pendingPoints">
                    <i class="fas fa-flag me-1"></i> You have earned
                    <strong>{{ walletStore.pendingPoints }}</strong> points with milestone rewards!
                </b-alert>
            </template>

            <b-form-group description="Claim wallet ownership with this code.">
                <b-form-input :state="isValidUUID" v-model="uuid" placeholder="Code" />
            </b-form-group>

            <b-button
                v-if="accountStore.isAuthenticated"
                @click="onClickCollect"
                variant="success"
                class="w-100"
                :disabled="!!error || isWaitingForWalletAddress || isLoadingCollect"
            >
                <b-spinner v-if="isLoadingCollect" small variant="dark" />
                Collect rewards
            </b-button>
            <b-button v-else @click="onClickSignin" variant="primary" class="w-100"> Sign in &amp; Collect </b-button>
        </b-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';
import { useWalletStore } from '../stores/Wallet';
import { useRewardStore } from '../stores/Reward';
import BaseAlertWalletAddress from '../components/BaseAlertWalletAddress.vue';
import { validate } from 'uuid';

export default defineComponent({
    name: 'CollectWallet',
    components: { BaseAlertWalletAddress },
    data() {
        return {
            uuid: '',
            error: '',
            isLoadingImage: true,
            isLoadingCollect: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        ...mapStores(useWalletStore),
        isWaitingForWalletAddress() {
            const { wallet } = useWalletStore();
            return !wallet || !wallet.address;
        },
        isValidUUID() {
            if (!this.uuid) return null;
            return validate(this.uuid);
        },
    },
    mounted() {
        this.isLoadingCollect = true;
        this.uuid = this.$route.params.uuid as string;
        this.walletStore.getTransfer(this.uuid).then(() => {
            this.isLoadingCollect = false;
        });
    },
    watch: {
        'accountStore.isAuthenticated'() {
            this.isLoadingCollect = true;
            this.walletStore.getTransfer(this.uuid).then(() => {
                this.isLoadingCollect = false;
            });
        },
    },
    methods: {
        async onClickCollect() {
            try {
                await this.accountStore.api.request.patch('/v1/account/wallet', {
                    body: JSON.stringify({ token: this.uuid }),
                });
                await this.rewardsStore.list();
                this.$router.push(`/${this.accountStore.poolId}/earn`);
            } catch (error) {
                this.error = (error as Error).message || 'Something went wrong..';
            }
        },
        async onClickSignin() {
            this.accountStore.signin({
                wallet_transfer_token: this.uuid,
            });
        },
    },
});
</script>
<style scoped>
.card {
    margin-top: -65px !important;
}
</style>

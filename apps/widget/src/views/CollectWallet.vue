<template>
    <div class="d-flex flex-grow-1 justify-content-center flex-column align-items-center overflow-auto">
        <b-card class="m-2 w-75">
            <b-alert v-if="!accountStore.isAuthenticated" variant="info" show class="p-2">
                <i class="fas fa-gift me-1"></i>
                Sign in to collect your Wallet
            </b-alert>
            <p>This wallet has been created for you and contains points you earned with app engagement.</p>
            <b-button
                v-if="accountStore.isAuthenticated && !isLoadingCollectComplete"
                @click="onClickCollect"
                variant="success"
                class="w-100"
                :disabled="!!error || isWaitingForWalletAddress"
            >
                <b-spinner v-if="isLoadingCollect" small variant="dark" />
                Collect
            </b-button>
            <b-button v-else @click="onClickSignin" variant="primary" class="w-100"> Sign in &amp; Collect </b-button>
        </b-card>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';
import { useClaimStore } from '../stores/Claim';
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'CollectWallet',
    components: {},
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useClaimStore),
        ...mapStores(useWalletStore),
        isWaitingForWalletAddress() {
            const { wallet } = useWalletStore();
            return !wallet || !wallet.address;
        },
    },
    data() {
        return {
            uuid: '',
            error: '',
            isLoadingImage: true,
            isLoadingCollect: false,
            isLoadingCollectComplete: false,
        };
    },
    async mounted() {
        this.uuid = this.$route.params.uuid as string;
        // this.walletStore.getWallet(this.uuid);
    },
    methods: {
        onClickSignin() {
            this.accountStore.signin({ walletUUID: this.uuid });
        },
        onClickGoToWallet() {
            const { poolId } = this.accountStore;
            this.$router.push(`/${poolId}/wallet`);
        },
        async onClickCollect() {
            this.isLoadingCollect = true;
            try {
                await this.claimsStore.collect(this.uuid);
                await this.walletStore.list();

                this.isLoadingCollectComplete = true;
            } catch (res) {
                const { error } = res as { error: { message: string } };
                this.error = error.message;
            } finally {
                this.isLoadingCollect = false;
            }
        },
    },
});
</script>
<style scoped>
.card {
    margin-top: -65px !important;
}
</style>

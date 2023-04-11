<template>
    <div class="flex-grow-1 overflow-auto">
        <b-alert v-if="accountStore.isAuthenticated" variant="success" show class="m-2 p-2">
            <i class="fas fa-gift me-1"></i>
            You are able to collect your NFT!
        </b-alert>
        <b-alert v-else variant="info" show class="m-2 p-2">
            <i class="fas fa-gift me-1"></i>
            Sign in to collect your NFT
        </b-alert>
        <b-alert v-if="error" variant="danger" show class="m-2 p-2">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <b-card
            v-if="claimsStore.claim && claimsStore.metadata && claimsStore.erc721"
            class="m-2"
            :img-src="claimsStore.metadata.imageUrl"
        >
            <div class="d-flex justify-content-center">
                <ConfettiExplosion
                    v-if="isLoadingCollectComplete"
                    :stageHeight="400"
                    :stageWidth="500"
                    :particleCount="200"
                    :duration="3500"
                    :colors="['#98D80D', '#972d15', '#fcec53']"
                    :force="0.5"
                />
            </div>
            <b-card-title> {{ claimsStore.metadata.name }}</b-card-title>
            <p>{{ claimsStore.metadata.description }}</p>
            <hr />
            <p class="d-flex align-items-center">
                <span>Contract</span>
                <b-link
                    class="ms-auto text-accent"
                    :href="`https://polygonscan.com/address/${claimsStore.erc721.address}`"
                    target="_blank"
                >
                    <strong v-b-tooltip :title="claimsStore.erc721.description" class="ms-auto">
                        {{ claimsStore.erc721.name }}
                    </strong>
                </b-link>
            </p>
            <p class="d-flex align-items-center">
                <span>Website</span>
                <b-link class="ms-auto text-accent" :href="claimsStore.metadata.externalUrl" target="_blank">
                    <strong>
                        <i class="fas fa-external-link-alt"></i>
                    </strong>
                </b-link>
            </p>
            <p class="d-flex align-items-center">
                <span>Token Standard</span>
                <strong class="ms-auto">ERC-721</strong>
            </p>
            <p class="d-flex align-items-center">
                <span>Symbol</span>
                <strong class="ms-auto">{{ claimsStore.erc721.symbol }}</strong>
            </p>
            <b-button v-if="accountStore.isAuthenticated" @click="onClickCollect" variant="success" class="w-100">
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
import ConfettiExplosion from 'vue-confetti-explosion';

export default defineComponent({
    name: 'Home',
    components: { ConfettiExplosion },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useClaimStore),
        ...mapStores(useWalletStore),
    },
    data() {
        return { uuid: '', error: '', isLoadingCollect: false, isLoadingCollectComplete: false };
    },
    async mounted() {
        this.uuid = this.$route.params.uuid as string;
        await this.claimsStore.getClaim(this.uuid);
    },
    methods: {
        onClickSignin() {
            this.accountStore.signin();
        },
        async onClickCollect() {
            this.isLoadingCollect = true;
            try {
                await this.claimsStore.collect(this.uuid);
                await this.walletStore.list();
                this.$router.push('/wallet');
            } catch (res) {
                const { error } = res as { error: { message: string } };
                this.error = error.message;
            } finally {
                this.isLoadingCollectComplete = true;
                this.isLoadingCollect = false;
            }
        },
    },
});
</script>
<style scoped>
.card {
    min-height: calc(100% - 65px) !important;
}
</style>

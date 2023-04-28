<template>
    <div class="d-flex flex-grow-1 justify-content-center flex-column align-items-center overflow-auto">
        <b-card v-if="claimsStore.claim && claimsStore.metadata && claimsStore.erc721" class="m-2">
            <b-alert v-if="!accountStore.isAuthenticated" variant="info" show class="p-2">
                <i class="fas fa-gift me-1"></i>
                Sign in to collect your NFT
            </b-alert>
            <b-alert v-if="accountStore.isAuthenticated && !walletStore.wallet" variant="info" show class="p-2">
                <b-spinner small class="me-1" />
                Preparing your smart wallet...
            </b-alert>
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
            <div class="d-flex">
                <div class="d-flex justify-content-center align-items-center" style="width: 75px">
                    <div>
                        <b-spinner v-if="isLoadingImage" small variant="light" />
                        <b-img
                            :src="claimsStore.metadata.imageUrl"
                            width="60"
                            class="me-3 rounded shadow-sm"
                            :class="{ 'd-none': isLoadingImage }"
                            @load="isLoadingImage = false"
                        />
                    </div>
                </div>
                <div>
                    <b-card-title> {{ claimsStore.metadata.name }}</b-card-title>
                    <p class="m-0">{{ claimsStore.metadata.description }}</p>
                </div>
            </div>
            <hr />
            <p class="d-flex align-items-center small">
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
            <p class="d-flex align-items-center small">
                <span>Website</span>
                <b-link class="ms-auto text-accent" :href="claimsStore.metadata.externalUrl" target="_blank">
                    <strong>
                        <i class="fas fa-external-link-alt"></i>
                    </strong>
                </b-link>
            </p>
            <p class="d-flex align-items-center small">
                <span>Token Standard</span>
                <strong class="ms-auto">ERC-721</strong>
            </p>
            <p class="d-flex align-items-center small">
                <span>Symbol</span>
                <strong class="ms-auto">{{ claimsStore.erc721.symbol }}</strong>
            </p>
            <b-alert v-if="error || claimsStore.error" variant="danger" show class="p-2 w-100">
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ error || claimsStore.error }}
            </b-alert>

            <b-button v-if="isLoadingCollectComplete" variant="primary" @click="onClickGoToWallet" class="w-100">
                Go to wallet
            </b-button>
            <b-button
                v-else-if="accountStore.isAuthenticated && !isLoadingCollectComplete"
                @click="onClickCollect"
                variant="success"
                class="w-100"
                :disabled="!!error || !!claimsStore.error || !walletStore.wallet"
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
import ConfettiExplosion from 'vue-confetti-explosion';
import poll from 'promise-poller';

export default defineComponent({
    name: 'Home',
    components: { ConfettiExplosion },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useClaimStore),
        ...mapStores(useWalletStore),
    },
    data() {
        return { uuid: '', error: '', isLoadingImage: true, isLoadingCollect: false, isLoadingCollectComplete: false };
    },
    async mounted() {
        this.uuid = this.$route.params.uuid as string;
        this.claimsStore.getClaim(this.uuid);
    },
    methods: {
        waitForWallet() {
            const taskFn = async () => {
                await this.walletStore.getWallet();
                if (this.walletStore.wallet) {
                    return Promise.resolve();
                } else {
                    return Promise.reject('Could not find wallet');
                }
            };

            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        onClickSignin() {
            this.accountStore.signin();
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

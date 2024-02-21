<template>
    <b-container>
        <b-row>
            <b-col offset-xl="1" xl="6">
                <b-card v-if="claimsStore.claim && claimsStore.metadata && claimsStore.erc721" class="mx-auto my-2">
                    <b-alert v-model="isAlertInfoShown" variant="info" show class="p-2">
                        <i class="fas fa-gift me-1"></i>
                        Sign in to collect your NFT
                    </b-alert>

                    <b-alert v-model="isAlertErrorShown" variant="danger" show class="p-2">
                        <i class="fas fa-exclamation-circle me-1"></i>
                        {{ error || claimsStore.error }}
                    </b-alert>

                    <div class="d-flex justify-content-center">
                        <ConfettiExplosion
                            v-if="isLoadingCollectComplete"
                            class="position-fixed"
                            style="pointer-events: none"
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

                    <BaseFormGroupWalletSelect @update="wallet = $event" :chain-id="claimsStore.erc721.chainId" />

                    <b-button
                        v-if="isLoadingCollectComplete"
                        variant="primary"
                        @click="onClickGoToWallet"
                        class="w-100"
                    >
                        Continue
                    </b-button>
                    <b-button
                        v-else-if="accountStore.isAuthenticated && !isLoadingCollectComplete"
                        @click="onClickCollect"
                        variant="success"
                        class="w-100"
                        :disabled="!!error || !!claimsStore.error || isLoadingCollect || !wallet"
                    >
                        <b-spinner v-if="isLoadingCollect" small variant="dark" />
                        <template v-else>Collect</template>
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
import { useClaimStore } from '../../stores/Claim';
import { useWalletStore } from '../../stores/Wallet';
import ConfettiExplosion from 'vue-confetti-explosion';

export default defineComponent({
    name: 'Home',
    components: { ConfettiExplosion },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useClaimStore, useWalletStore),
        isAlertInfoShown() {
            return !this.accountStore.isAuthenticated && !this.claimsStore.error;
        },
        isAlertErrorShown() {
            return !!this.error || !!this.claimsStore.error;
        },
    },
    data() {
        return {
            uuid: '',
            error: '',
            wallet: null,
            isLoadingImage: true,
            isLoadingCollect: false,
            isLoadingCollectComplete: false,
        };
    },
    watch: {
        'accountStore.account': {
            async handler(account) {
                if (!account) return;
                this.walletStore.listWallets();
            },
            immediate: true,
        },
    },
    async mounted() {
        this.uuid = this.$route.params.uuid as string;
        this.claimsStore.getClaim(this.uuid);
    },
    methods: {
        onClickSignin() {
            this.accountStore.signin();
        },
        onClickGoToWallet() {
            this.$router.push(`/c/${this.accountStore.config.slug}/wallets`);
        },
        async onClickCollect() {
            if (!this.wallet) return;

            this.isLoadingCollect = true;
            try {
                await this.claimsStore.collect(this.uuid, this.wallet);
                this.walletStore.list();

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

<template>
    <b-container>
        <b-row>
            <b-col offset-xl="3" xl="6">
                <b-alert v-if="!qrcodeStore.entry" v-model="isAlertErrorShown" variant="danger" show class="p-2">
                    <i class="fas fa-exclamation-circle me-1"></i>
                    {{ error }}
                </b-alert>
                <b-card v-if="qrcodeStore.entry && qrcodeStore.metadata && qrcodeStore.erc721" class="mx-auto my-2">
                    <b-alert v-model="isAlertErrorShown" variant="danger" show class="p-2">
                        <i class="fas fa-exclamation-circle me-1"></i>
                        {{ error }}
                    </b-alert>

                    <div class="d-flex justify-content-center">
                        <ConfettiExplosion
                            v-if="isLoadingCollectComplete"
                            class="position-fixed"
                            style="pointer-events: none"
                            :stage-height="400"
                            :stage-width="500"
                            :particle-count="200"
                            :duration="3500"
                            :colors="['#98D80D', '#972d15', '#fcec53']"
                            :force="0.5"
                        />
                    </div>
                    <div class="d-flex flex-column">
                        <div class="d-flex justify-content-center align-items-center">
                            <div>
                                <b-spinner v-if="isLoadingImage" small variant="light" />
                                <b-img
                                    :src="qrcodeStore.metadata.imageUrl"
                                    fluid
                                    style="max-height: 200px"
                                    class="rounded shadow-sm"
                                    :class="{ 'd-none': isLoadingImage }"
                                    @load="isLoadingImage = false"
                                />
                            </div>
                        </div>
                        <b-card-title class="mt-3"> {{ qrcodeStore.metadata.name }}</b-card-title>
                        <p class="m-0">{{ qrcodeStore.metadata.description }}</p>
                    </div>
                    <hr />
                    <p class="d-flex align-items-center small">
                        <span>Contract</span>
                        <b-link
                            class="ms-auto text-accent"
                            :href="`https://polygonscan.com/address/${qrcodeStore.erc721.address}`"
                            target="_blank"
                        >
                            <strong v-b-tooltip :title="qrcodeStore.erc721.description" class="ms-auto">
                                {{ qrcodeStore.erc721.name }}
                            </strong>
                        </b-link>
                    </p>
                    <p class="d-flex align-items-center small">
                        <span>Website</span>
                        <b-link class="ms-auto text-accent" :href="qrcodeStore.metadata.externalUrl" target="_blank">
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
                        <strong class="ms-auto">{{ qrcodeStore.erc721.symbol }}</strong>
                    </p>

                    <BaseFormGroupWalletSelect
                        v-if="accountStore.isAuthenticated"
                        :chain-id="qrcodeStore.erc721.chainId"
                        @update="wallet = $event"
                    />

                    <b-button
                        v-if="isLoadingCollectComplete && accountStore.isMobile"
                        variant="primary"
                        class="w-100"
                        @click="onClickGoToWallet"
                    >
                        Continue
                    </b-button>
                    <b-button
                        v-else-if="accountStore.isAuthenticated && !isLoadingCollectComplete"
                        variant="success"
                        class="w-100"
                        :disabled="!!error || isLoadingCollect || !wallet"
                        @click="onClickCollect"
                    >
                        <b-spinner v-if="isLoadingCollect" small variant="dark" />
                        <template v-else>Collect</template>
                    </b-button>
                    <b-button v-else variant="primary" class="w-100" @click="authStore.isModalLoginShown = true">
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
import { useQRCodeStore } from '../../stores/QRCode';
import { useWalletStore } from '../../stores/Wallet';
import ConfettiExplosion from 'vue-confetti-explosion';

export default defineComponent({
    name: 'Home',
    components: { ConfettiExplosion },
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
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQRCodeStore, useWalletStore),
        isAlertInfoShown() {
            return !this.accountStore.isAuthenticated;
        },
        isAlertErrorShown() {
            return !!this.error;
        },
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
    mounted() {
        this.uuid = this.$route.params.uuid as string;
        this.getEntry();
    },
    methods: {
        async getEntry() {
            try {
                await this.qrcodeStore.getEntry(this.uuid);
                if (this.qrcodeStore.entry && this.qrcodeStore.entry.sub) {
                    this.error = 'This QR code has been used already.';
                }
            } catch (res) {
                const { error } = res as { error: { message: string } };
                this.error = error.message;
            }
        },
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
                await this.qrcodeStore.collect(this.uuid, this.wallet);
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

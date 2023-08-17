<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1">
        <b-row>
            <b-col offset-xl="1" xl="6">
                <b-card class="mx-auto my-2">
                    <b-alert v-model="isAlertSigninShown" variant="info" show class="p-2">
                        <i class="fas fa-gift me-1"></i>
                        Sign in to connect your virtual wallet
                    </b-alert>

                    <template v-if="!isAlertSigninShown">
                        <BaseAlertWalletAddress />
                        <b-alert variant="info" show class="p-2" v-model="isAlertInfoShown">
                            <i class="fas fa-flag me-1"></i> Complete Quests and earn
                            <strong>{{ walletStore.pendingPoints }}</strong> points!
                        </b-alert>
                    </template>

                    <b-card-title>Virtual Wallet</b-card-title>
                    <hr />
                    <b-form-group description="Provide a wallet code to connect it and complete your quests.">
                        <b-form-input :state="isValidUUID" v-model="uuid" placeholder="Code" />
                    </b-form-group>
                    <b-button
                        v-if="authStore.oAuthShare"
                        @click="onClickCollect"
                        variant="success"
                        class="w-100"
                        :disabled="!!error || isWaitingForWalletAddress || isLoadingCollect"
                    >
                        <b-spinner v-if="isLoadingCollect" small variant="dark" />
                        Connect Virtual Wallet
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
import BaseAlertWalletAddress from '../../components/BaseAlertWalletAddress.vue';
import { validate } from 'uuid';

export default defineComponent({
    name: 'ConnectWallet',
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
        ...mapStores(useAuthStore),
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
        isAlertInfoShown() {
            return !!this.walletStore.pendingPoints;
        },
        isAlertSigninShown() {
            return !this.authStore.oAuthShare;
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
        'authStore.oAuthShare'() {
            this.isLoadingCollect = true;
            this.walletStore.getTransfer(this.uuid).then(() => {
                this.isLoadingCollect = false;
            });
        },
    },
    methods: {
        async onClickCollect() {
            this.isLoadingCollect = true;
            try {
                await this.accountStore.api.request.post('/v1/account/wallet/connect', {
                    body: JSON.stringify({ code: this.uuid }),
                });
                await this.rewardsStore.list();
                this.$router.push(`/c/${this.accountStore.poolId}/quests`);
            } catch (error) {
                this.error = (error as Error).message || 'Something went wrong..';
            } finally {
                this.isLoadingCollect = false;
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

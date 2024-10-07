<template>
    <b-modal
        v-model="web3authStore.isModalWalletRecoveryShown"
        no-close-on-backdrop
        centered
        hide-footer
        no-close-on-esc
        @show="onShow"
        @hidden="web3authStore.isModalWalletRecoveryShown = false"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-key me-2"></i> Wallet Recovery</h5>
            <b-link class="btn-close" @click="web3authStore.isModalWalletRecoveryShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>

        <b-alert v-model="isFailedRecovery" show variant="danger" class="p-2">
            <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
        </b-alert>

        <b-form v-if="!isResetWarningShown">
            <b-form-group :label="web3authStore.securityQuestion">
                <b-form-input v-model="passwordRecovery" type="password" placeholder="Answer" autocomplete="off" />
            </b-form-group>
            <b-button
                class="w-100"
                variant="primary"
                :disabled="!!web3authStore.isDeviceShareAvailable || !passwordRecovery.length"
                @click="onSubmitDeviceShareRecovery"
            >
                <b-spinner v-if="isLoadingPasswordRecovery" small variant="light" />
                <template v-else> Recover Key </template>
            </b-button>
            <b-button variant="link" class="text-danger w-100 mt-2" @click="onClickReset">
                Reset Wallet (1/2)
            </b-button>
        </b-form>
        <template v-else>
            <b-alert v-model="isResetWarningShown" show variant="danger" class="mt-3 p-2">
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ warningText }}<br />
                <b-link class="w-100" target="_blank" href="">Contact Support</b-link>
            </b-alert>
            <b-form-group label="Confirm Reset" description="Type 'reset' to create a new wallet for this account.">
                <b-form-input v-model="inputConfirm" placeholder="reset" />
            </b-form-group>
            <b-button variant="danger" class="w-100" :disabled="inputConfirm !== 'reset'" @click="onClickResetContinue">
                Reset (2/2)
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore, useWalletStore, useWeb3AuthStore } from '@thxnetwork/wallet/stores';
import { toast } from '@thxnetwork/wallet/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWalletCreate',
    data() {
        return {
            warningText:
                'By choosing to proceed, you will loose access to the Coin and NFT rewards stored in your wallet.',
            error: '',
            isShown: false,
            question: '',
            passwordRecovery: '',
            inputConfirm: '',
            isLoadingPasswordRecovery: false,
            isFailedRecovery: false,
            isResetWarningShown: false,
            isAcknowledged: true,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWeb3AuthStore, useWalletStore),
    },
    methods: {
        async onShow() {
            this.question = this.web3authStore.securityQuestion;
        },
        async onSubmitDeviceShareRecovery() {
            this.error = '';
            this.isLoadingPasswordRecovery = true;
            this.isFailedRecovery = false;
            try {
                await this.web3authStore.recoverDeviceShare(this.passwordRecovery);
                this.passwordRecovery = '';
                this.web3authStore.isModalWalletRecoveryShown = false;
            } catch (error: any) {
                console.error(error);
                toast(error.message, 'light', 3000, () => {
                    return;
                });
                this.isFailedRecovery = true;
            } finally {
                this.isLoadingPasswordRecovery = false;
            }
        },
        onClickReset() {
            this.isResetWarningShown = true;
        },
        async onClickResetContinue() {
            await this.web3authStore.resetKey();
            window.location.reload();
        },
    },
});
</script>

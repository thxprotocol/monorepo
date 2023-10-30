<template>
    <b-modal
        v-model="walletStore.isModalWalletRecoveryShown"
        @show="onShow"
        @hidden="walletStore.isModalWalletRecoveryShown = false"
        no-close-on-backdrop
        centered
        hide-footer
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-key me-2"></i> Wallet Recovery</h5>
            <b-link class="btn-close" @click="walletStore.isModalWalletSettingsShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>

        <b-alert v-model="isFailedRecovery" show variant="danger" class="p-2">
            <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
        </b-alert>

        <b-form v-if="!isResetWarningShown">
            <b-form-group :label="authStore.securityQuestion">
                <b-form-input v-model="passwordRecovery" type="password" placeholder="Answer" autocomplete="off" />
            </b-form-group>
            <b-button
                class="w-100"
                variant="primary"
                @click="onSubmitDeviceShareRecovery"
                :disabled="!!authStore.isDeviceShareAvailable || !passwordRecovery.length"
            >
                <b-spinner small variant="light" v-if="isLoadingPasswordRecovery" />
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
                <b-form-input placeholder="reset" v-model="inputConfirm" />
            </b-form-group>
            <b-button variant="danger" class="w-100" :disabled="inputConfirm !== 'reset'" @click="onClickResetContinue">
                Reset (2/2)
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../stores/Auth';
import { useAccountStore } from '../stores/Account';
import { useWalletStore } from '../stores/Wallet';
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
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useWalletStore),
        currentKeyTreshold() {
            const { oAuthShare, isDeviceShareAvailable } = useAuthStore();

            let i = 0;
            if (oAuthShare) i++;
            if (isDeviceShareAvailable) i++;

            return `${i}/3`;
        },
    },
    methods: {
        async onShow() {
            this.question = this.authStore.securityQuestion;
        },
        async onSubmitDeviceShareRecovery() {
            this.error = '';
            this.isLoadingPasswordRecovery = true;
            this.isFailedRecovery = false;
            try {
                await this.authStore.recoverDeviceShare(this.passwordRecovery);
                this.passwordRecovery = '';
                this.walletStore.isModalWalletRecoveryShown = false;
            } catch (error) {
                this.error = (error as Error).message;
                this.isFailedRecovery = true;
            } finally {
                this.isLoadingPasswordRecovery = false;
            }
        },
        onClickReset() {
            this.isResetWarningShown = true;
        },
        async onClickResetContinue() {
            await this.authStore.resetKey();
            window.location.reload();
        },
    },
});
</script>

<template>
    <b-alert v-model="isAlertDangerShown" variant="primary" show class="p-2 px-3">
        <i class="fas fa-exclamation-circle me-2" /> {{ error }}
    </b-alert>

    <b-alert v-model="isAlertWarningShown" variant="warning" show class="p-2 px-3">
        <i class="fas fa-exclamation-circle me-2" />
        <span>Store your secret answer safely!</span>
    </b-alert>

    <!-- <b-form-group label="Network">
        <b-form-select v-model="chainId" :options="chainList" />
    </b-form-group> -->

    <BaseFormGroup
        label="Security Question"
        description="This question will be asked when you sign in on another device."
    >
        <b-form-input v-model="question" placeholder="Question" />
    </BaseFormGroup>

    <BaseFormGroup>
        <b-form-input
            v-model="password"
            :state="isPasswordLengthValid"
            type="password"
            placeholder="Answer"
            autocomplete="off"
        />
        <span v-if="isPasswordLengthValid === false" class="invalid-feedback d-inline">
            Use 10 or more characters.
        </span>
    </BaseFormGroup>

    <BaseFormGroup>
        <b-form-input
            v-model="passwordCheck"
            :state="isPasswordCheckLengthValid && isPasswordCheckEqualValid"
            type="password"
            placeholder="Answer again"
            autocomplete="off"
        />
        <span v-if="isPasswordCheckLengthValid === false" class="invalid-feedback d-inline">
            Use 10 or more characters.
        </span>
        <span v-if="isPasswordCheckEqualValid === false" class="invalid-feedback d-inline">
            Passwords are not equal.
        </span>
    </BaseFormGroup>

    <b-button :disabled="isDisabled" class="w-100 mt-3" variant="primary" @click="onClickCreate">
        <b-spinner v-if="isLoading" small variant="light" />
        <template v-else> Create Wallet </template>
    </b-button>
</template>

<script lang="ts">
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import { useAccountStore, useWalletStore, useWeb3AuthStore } from '@thxnetwork/wallet/stores';
import { toast } from '@thxnetwork/wallet/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseTabWalletWeb3Auth',
    data() {
        return {
            WalletVariant,
            variant: WalletVariant.Safe,
            username: '',
            question: '',
            password: '',
            passwordCheck: '',
            isUsernameInvalid: false,
            error: '',
            show: false,
            message: 'This signature will be used to proof ownership of a web3 account.',
            signature: '',
            isLoading: false,
            chainId: ChainId.Polygon,
            chainList: [
                { value: ChainId.Polygon, text: 'Polygon' },
                // { value: ChainId.Linea, text: 'Linea' },
            ],
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWeb3AuthStore, useWalletStore),
        isAlertWarningShown() {
            return true;
        },
        isAlertDangerShown() {
            return !!this.error;
        },
        isPasswordLengthValid() {
            if (this.password.length >= 10) return true;
            if (this.password.length && this.password.length < 10) return false;
            return null;
        },
        isPasswordCheckLengthValid() {
            if (this.passwordCheck.length >= 10) return true;
            if (this.passwordCheck.length && this.passwordCheck.length < 10) return false;
            return null;
        },
        isPasswordCheckEqualValid() {
            if (this.password && this.password === this.passwordCheck) return true;
            if (this.password.length && this.passwordCheck.length && this.password !== this.passwordCheck) return false;
            return null;
        },
        isPasswordValid() {
            return this.isPasswordLengthValid && this.isPasswordCheckLengthValid && this.isPasswordCheckEqualValid;
        },
        isDisabled() {
            return !this.chainId || !!this.error || this.isLoading || !this.isPasswordValid;
        },
    },
    methods: {
        async onClickCreate() {
            this.isLoading = true;

            try {
                if (this.variant === WalletVariant.Safe && !this.chainId) {
                    throw new Error('No chain ID configured.');
                }

                // Create OAuthshare
                await this.web3authStore._triggerLogin();
                if (!this.web3authStore.oAuthShare) throw new Error('Could not create the OAuthshare.');

                // Construct the private key
                await this.web3authStore._getDeviceShare();
                await this.web3authStore._reconstructKey();
                if (!this.web3authStore.wallet) throw new Error('Could not construct your private key.');

                // Create Device Share with security question
                await this.web3authStore._createDeviceShare(this.question, this.password);

                // Sign message
                this.signature = (await this.web3authStore.sign(this.message)) as string;

                // Create Safe Wallet
                await this.walletStore.create({
                    variant: WalletVariant.Safe,
                    message: this.message,
                    signature: this.signature,
                    chainId: this.chainId,
                });

                this.walletStore.isModalWalletCreateShown = false;
            } catch (error: any) {
                console.error(error);
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

<template>
    <b-alert variant="warning" show class="p-2 px-3">
        <i class="fas fa-exclamation-circle me-2" />
        <span>Store your secret answer safely!</span>
    </b-alert>

    <b-form-group description="This question will be asked when you sign in on another device.">
        <b-form-input v-model="question" placeholder="Question" />
    </b-form-group>

    <b-form-group>
        <b-form-input
            :state="isPasswordLengthValid"
            v-model="password"
            type="password"
            placeholder="Answer"
            autocomplete="off"
        />
        <span v-if="isPasswordLengthValid === false" class="invalid-feedback d-inline">
            Use 10 or more characters.
        </span>
    </b-form-group>

    <b-form-group>
        <b-form-input
            :state="isPasswordCheckLengthValid && isPasswordCheckEqualValid"
            v-model="passwordCheck"
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
    </b-form-group>

    <b-button :disabled="isDisabled" class="w-100 mt-3" variant="primary" @click="onClickCreate">
        <b-spinner small variant="light" v-if="isLoading" />
        <template v-else> Create Wallet </template>
    </b-button>
</template>

<script lang="ts">
import { WalletVariant } from '../../types/enums/accountVariant';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useWalletStore } from '../../stores/Wallet';
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
            isCreateFailed: false,
            isUsernameInvalid: false,
            error: '',
            show: false,
            message: 'This signature will be used to proof ownership of a web3 account.',
            signature: '',
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore),
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
            return !!this.error || this.isLoading || !this.isPasswordValid;
        },
    },
    methods: {
        async onClickCreate() {
            this.isLoading = true;
            try {
                // Create OAuthshare
                await this.authStore.triggerLogin();
                if (!this.authStore.oAuthShare) throw new Error('Could not create the OAuthshare.');

                // Construct the private key
                await this.authStore.getPrivateKey();
                if (!this.authStore.wallet) throw new Error('Could not construct your private key.');

                // Create Device Share with security question
                await this.authStore.createDeviceShare(this.question, this.password);

                // Sign message
                this.signature = await this.authStore.sign(this.message);

                // Create Safe Wallet
                await this.walletStore.create({
                    variant: WalletVariant.Safe,
                    message: this.message,
                    signature: this.signature,
                });

                this.isLoading = false;
                this.$emit('close');
            } catch (error) {
                this.isLoading = false;
                this.isCreateFailed = true;
                console.error(error);
            }
        },
    },
});
</script>

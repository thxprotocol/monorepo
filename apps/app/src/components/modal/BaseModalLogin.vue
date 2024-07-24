<template>
    <b-modal v-model="authStore.isModalLoginShown" centered hide-footer @hidden="authStore.isModalLoginShown = false">
        <template #header>
            <h5 class="modal-title">
                <i class="fas fa-id-badge me-2" />
                Access your account
            </h5>
            <b-link class="btn-close" @click="authStore.isModalLoginShown = false"><i class="fas fa-times"></i></b-link>
        </template>
        <b-alert v-model="isAlertErrorShown" class="p-2" variant="primary">
            <i class="fas fa-exclamation-triangle me-2" />
            {{ error }}
        </b-alert>
        <template v-if="!isEmailSent">
            <b-form-group>
                <b-form-input v-model="email" :state="isEmailValid" placeholder="E-mail" />
            </b-form-group>
            <b-button
                variant="primary"
                :disabled="!isEmailValid || isLoading"
                class="w-100"
                @click="onClickSigninOTP()"
            >
                <b-spinner v-if="isLoading" small />
                <template v-else>
                    Send one-time password
                    <i class="fas fa-chevron-right ms-2"></i>
                </template>
            </b-button>
        </template>
        <template v-else>
            <b-form-group>
                <b-form-input v-model="otp" placeholder="One-time password" />
            </b-form-group>
            <b-button
                :variant="isOTPValid ? 'success' : 'primary'"
                :disabled="!isOTPValid || isLoading"
                class="w-100"
                @click="onClickVerifyOTP()"
            >
                <b-spinner v-if="isLoading" small />
                <template v-else>
                    Verify one-time password
                    <i class="fas fa-chevron-right ms-2"></i>
                </template>
            </b-button>
        </template>
        <hr />
        <b-form-group>
            <BaseButtonWalletConnect
                message="This message is used for authentication purposes."
                @signed="onSigned"
                @error="error = $event"
            >
                <b-img :src="imgWalletConnect" width="20" class="me-2 rounded" />
                <span>
                    Continue with
                    <strong>{{ walletStore.account && shortenAddress(walletStore.account.address) }}</strong>
                </span>
            </BaseButtonWalletConnect>
        </b-form-group>
        <hr class="or-separator" />
        <b-form-group label="Use a trusted provider" label-class="text-opaque">
            <b-button variant="primary" class="rounded me-2 px-3" @click="onClickSigninOAuth(AccountVariant.SSOGoogle)">
                <i class="fab fa-google"></i>
            </b-button>
            <b-button
                variant="primary"
                class="rounded me-2 px-3"
                @click="onClickSigninOAuth(AccountVariant.SSODiscord)"
            >
                <i class="fab fa-discord"></i>
            </b-button>
            <b-button
                variant="primary"
                class="rounded me-2 px-3"
                @click="onClickSigninOAuth(AccountVariant.SSOTwitter)"
            >
                <i class="fab fa-twitter"></i>
            </b-button>
            <b-button variant="primary" class="rounded me-2 px-3" @click="onClickSigninOAuth(AccountVariant.SSOTwitch)">
                <i class="fab fa-twitch"></i>
            </b-button>
            <b-button variant="primary" class="rounded me-2 px-3" @click="onClickSigninOAuth(AccountVariant.SSOGithub)">
                <i class="fab fa-github"></i>
            </b-button>
        </b-form-group>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { AccountVariant } from '../../types/enums/accountVariant';
import { shortenAddress } from '../../utils/address';
import imgWalletConnect from '../../assets/walletconnect-logo.png';

export default defineComponent({
    name: 'BaseModalAccount',
    data() {
        return {
            AccountVariant,
            imgWalletConnect,
            error: '',
            email: '',
            otp: '',
            isEmailSubmitted: false,
            isShown: false,
            isLoading: false,
            shortenAddress,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore, useWalletStore),
        isAlertErrorShown() {
            return !!this.error;
        },
        isEmailValid() {
            if (!this.email) return null;
            const isEmail =
                this.email.length && this.email.length > 3 && this.email.includes('@') && this.email.includes('.');
            return !!isEmail;
        },
        isOTPValid() {
            if (!this.otp) return null;
            return this.otp.length === 6;
        },
        isEmailSent() {
            return !this.error && this.email && this.isEmailSubmitted;
        },
    },
    methods: {
        onClickSignout() {
            this.accountStore.signout();
            this.accountStore.isModalAccountShown = false;
        },
        async onClickSigninOTP() {
            try {
                this.isLoading = true;
                await this.accountStore.signInWithOtp({ email: this.email });
                this.isEmailSubmitted = true;
            } catch (error) {
                this.error = error ? (error as Error).message : 'An issue occured. Please try again.';
            } finally {
                this.isLoading = false;
            }
        },
        async onClickVerifyOTP() {
            try {
                this.isLoading = true;
                await this.accountStore.verifyOtp({ email: this.email, token: this.otp });
                this.authStore.isModalLoginShown = false;
            } catch (error) {
                this.error = error ? (error as Error).message : 'An issue occured. Please try again.';
            } finally {
                this.isLoading = false;
            }
        },
        async onSigned({ signature, message }: { signature: string; message: string }) {
            this.isLoading = true;
            try {
                const { account } = this.walletStore;
                if (!account || !account.address) throw new Error('No account address found');

                await this.accountStore.signinWithWallet(account.address, {
                    signature,
                    message,
                });
            } catch (error) {
                this.error = (error as any).message;
            }
        },
        async onClickSigninOAuth(variant: AccountVariant) {
            this.isLoading = true;
            try {
                await this.accountStore.signInWithOAuth({ variant });
            } catch (error) {
                this.error = (error as any).message;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

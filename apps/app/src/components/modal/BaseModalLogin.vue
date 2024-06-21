<template>
    <b-modal id="modalLogin" v-model="authStore.isModalLoginShown" centered hide-footer>
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
        <b-form-group>
            <b-form-input v-model="email" :state="isEmailValid" placeholder="E-mail" />
        </b-form-group>
        <b-button
            variant="primary"
            :disabled="!isEmailValid"
            class="w-100"
            @click="onClickSignin(AccountVariant.EmailPassword)"
        >
            Send one-time password
            <i class="fas fa-chevron-right ms-2"></i>
        </b-button>
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
            <b-button variant="primary" class="rounded me-2 px-3" @click="onClickSignin(AccountVariant.SSOGoogle)">
                <i class="fab fa-google"></i>
            </b-button>
            <b-button variant="primary" class="rounded me-2 px-3" @click="onClickSignin(AccountVariant.SSODiscord)">
                <i class="fab fa-discord"></i>
            </b-button>
            <b-button variant="primary" class="rounded me-2 px-3" @click="onClickSignin(AccountVariant.SSOTwitter)">
                <i class="fab fa-twitter"></i>
            </b-button>
            <b-button variant="primary" class="rounded me-2 px-3" @click="onClickSignin(AccountVariant.SSOTwitch)">
                <i class="fab fa-twitch"></i>
            </b-button>
            <b-button variant="primary" class="rounded me-2 px-3" @click="onClickSignin(AccountVariant.SSOGithub)">
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
    },
    methods: {
        onClickSignout() {
            this.accountStore.signout();
            this.accountStore.isModalAccountShown = false;
        },
        async onSigned({ signature, message }: { signature: string; message: string }) {
            this.isLoading = true;
            await this.authStore.signin({
                auth_variant: AccountVariant.Metamask,
                auth_signature: signature,
                auth_message: message,
            });
            this.isLoading = false;
        },
        async onClickSignin(variant: AccountVariant) {
            this.isLoading = true;
            await this.authStore.signin(
                {
                    auth_variant: variant,
                    auth_email: this.email,
                    return_url: window.location.href,
                    poolId: this.accountStore.poolId,
                },
                { inviteCode: this.$route.params.code },
            );
            this.isLoading = false;
        },
    },
});
</script>

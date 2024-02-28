<template>
    <b-modal id="modalLogin" centered v-model="authStore.isModalLoginShown" hide-footer>
        <template #header>
            <h5 class="modal-title">
                <i class="fas fa-id-badge me-2" />
                Access your account
            </h5>
            <b-link class="btn-close" @click="authStore.isModalLoginShown = false"><i class="fas fa-times"></i></b-link>
        </template>
        <b-alert v-model="isAlertErrorShown" class="p-2" variant="primary">{{ error }}</b-alert>
        <b-form-group>
            <b-form-input :state="isEmailValid" v-model="email" placeholder="E-mail" />
        </b-form-group>
        <b-button
            @click="onClickSignin(AccountVariant.EmailPassword)"
            variant="primary"
            :disabled="!isEmailValid"
            class="w-100"
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
                    Connect
                    <strong>{{ walletStore.account && shortenAddress(walletStore.account.address) }}</strong>
                </span>
            </BaseButtonWalletConnect>
        </b-form-group>
        <hr class="or-separator" />
        <b-form-group label="Use a trusted provider" label-class="text-opaque">
            <b-button @click="onClickSignin(AccountVariant.SSOGoogle)" variant="primary" class="rounded me-2 px-3">
                <i class="fab fa-google"></i>
            </b-button>
            <b-button @click="onClickSignin(AccountVariant.SSODiscord)" variant="primary" class="rounded me-2 px-3">
                <i class="fab fa-discord"></i>
            </b-button>
            <b-button @click="onClickSignin(AccountVariant.SSOTwitter)" variant="primary" class="rounded me-2 px-3">
                <i class="fab fa-twitter"></i>
            </b-button>
            <b-button @click="onClickSignin(AccountVariant.SSOTwitch)" variant="primary" class="rounded me-2 px-3">
                <i class="fab fa-twitch"></i>
            </b-button>
            <b-button @click="onClickSignin(AccountVariant.SSOGithub)" variant="primary" class="rounded me-2 px-3">
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
import imgWalletConnect from '../../assets/walletconnect-logo.png';

function shortenAddress(address: string) {
    return `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`;
}

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
            return this.email.length && this.email.length > 3 && this.email.includes('@') && this.email.includes('.');
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
            await this.authStore.signin({ auth_variant: variant, auth_email: this.email });
            this.isLoading = false;
        },
    },
});
</script>

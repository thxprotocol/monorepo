<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @show="onShow"
        @hidden="isShown = false"
        centered
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-wallet me-2"></i> Wallet</h5>
            <b-link class="btn-close" @click="isShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>

        <b-form>
            <b-alert v-if="error" show variant="danger" class="p-2">{{ error }}</b-alert>

            <b-form-group>
                <template #label>
                    <div class="d-flex align-items-center">
                        <img
                            :src="walletLogoMap[wallet.variant]"
                            width="15"
                            height="15"
                            style="border-radius: 3px"
                            class="me-2"
                            alt="Safe Logo"
                        />
                        Wallet Address
                    </div>
                </template>
                <code>{{ wallet.address }}</code>
            </b-form-group>

            <template v-if="authStore.securityQuestion">
                <b-form-group>
                    <b-form-input v-model="question" placeholder="Question" />
                </b-form-group>
                <b-form-group :state="isPasswordValid" :invalid-feedback="'Use 10 or more characters'">
                    <b-form-input
                        :state="isPasswordValid"
                        v-model="password"
                        type="password"
                        placeholder="Answer"
                        autocomplete="off"
                    />
                </b-form-group>
                <b-form-group :state="isPasswordValid" :invalid-feedback="'Use 10 or more characters'">
                    <b-form-input
                        :state="isPasswordValid"
                        v-model="passwordCheck"
                        type="password"
                        placeholder="Answer again"
                        autocomplete="off"
                    />
                </b-form-group>
                <b-button
                    :disabled="!isPasswordValid || !authStore.isDeviceShareAvailable"
                    class="w-100"
                    variant="primary"
                    @click="onSubmitDeviceSharePasswordUpdate"
                >
                    <b-spinner small variant="light" v-if="isLoadingPasswordChange" />
                    <template v-else> Change Security Question </template>
                </b-button>
            </template>
        </b-form>
        <template #footer>
            <b-button class="w-100" variant="primary" @click="isShown = false"> Close </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { AccountVariant, WalletVariant } from '../../types/enums/accountVariant';
import { fromWei } from 'web3-utils';

export default defineComponent({
    name: 'BaseModalWallet',
    data() {
        return {
            isShown: false,
            walletLogoMap,
            WalletVariant,
            error: '',
            isCopied: false,
            isPrivateKeyHidden: true,
            question: '',
            password: '',
            passwordCheck: '',
            isLoadingReset: false,
            isLoadingPasswordChange: false,
            isMigratingTokens: false,
            erc20TokenMigrationCount: 0,
            erc721TokenMigrationCount: 0,
            fromWei,
        };
    },
    props: {
        id: String,
        wallet: { type: Object, required: true },
    },
    watch: {
        show(show: boolean) {
            this.isShown = show;
        },
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore, useWalletStore),
        privateKey() {
            if (!this.authStore.privateKey) return '';
            if (this.isPrivateKeyHidden) return this.authStore.privateKey.replace(/./g, '•');
            return this.authStore.privateKey;
        },
        currentKeyTreshold() {
            const { oAuthShare, isDeviceShareAvailable, isSecurityQuestionAvailable } = useAuthStore();

            let i = 0;
            if (oAuthShare) i++;
            if (isDeviceShareAvailable) i++;
            if (isSecurityQuestionAvailable) i++;

            return `${i}/3`;
        },
        isMetamaskAccount() {
            if (!this.accountStore.account) return false;
            return this.accountStore.account.variant === AccountVariant.Metamask;
        },
        isPasswordValid: function () {
            if (this.password.length >= 10 && this.password === this.passwordCheck) return true;
            if (this.password.length && this.password.length < 10) return false;
            return undefined;
        },
    },
    methods: {
        onCopySuccess() {
            this.isCopied = true;
        },
        async onShow() {
            this.password = '';
            this.passwordCheck = '';

            // await this.authStore.triggerLogin();
            // await this.authStore.getPrivateKey();
            // this.question = this.authStore.securityQuestion;
        },
        async onSubmitDeviceSharePasswordUpdate() {
            const { oAuthShare, isDeviceShareAvailable, updateDeviceShare } = this.authStore;
            if (!oAuthShare || !isDeviceShareAvailable) return;

            this.isLoadingPasswordChange = true;
            await updateDeviceShare(this.password, this.question);
            this.isLoadingPasswordChange = false;
            this.password = '';
            this.passwordCheck = '';
        },
        async onSubmitResetAccount() {
            this.isLoadingReset = true;
            await this.authStore.reset();
            this.isLoadingReset = false;
        },
    },
});
</script>

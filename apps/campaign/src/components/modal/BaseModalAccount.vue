<template>
    <b-modal
        v-model="accountStore.isModalAccountShown"
        @show="onShow"
        @hidden="accountStore.isModalAccountShown = false"
        centered
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-user me-2"></i> Account</h5>
            <b-link class="btn-close" @click="accountStore.isModalAccountShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>

        <div v-if="!accountStore.account" class="d-flex justify-content-center">
            <b-spinner small />
        </div>
        <b-form v-else>
            <b-alert v-if="error" show variant="danger" class="p-2">{{ error }}</b-alert>
            <b-tabs justified content-class="mt-3">
                <b-tab title="Profile">
                    <b-row>
                        <b-col cols="8">
                            <BaseFormGroupUsername class="mb-3" />
                            <BaseFormGroupEmail class="mb-3" />
                        </b-col>
                        <b-col cols="4" class="d-flex align-items-center justify-content-center">
                            <BaseFormGroupAvatar />
                        </b-col>
                    </b-row>
                    <BaseFormGroupSubscription v-if="accountStore.poolId && questStore.quests.length" class="mb-3" />
                    <BaseFormGroupConnected class="mb-3" />
                </b-tab>
                <b-tab title="Wallet">
                    <b-form-group v-if="walletStore.wallet && !isMetamaskAccount">
                        <template #label>
                            <div class="d-flex align-items-center">
                                <img
                                    v-b-tooltip
                                    title="Secured by Safe (f.k.a. Gnosis Safe)"
                                    :src="imgSafeLogo"
                                    width="15"
                                    height="15"
                                    style="border-radius: 3px"
                                    class="me-2"
                                    alt="Safe Logo"
                                />
                                Wallet Address
                            </div>
                        </template>
                        <code>{{ walletStore.wallet.address }}</code>
                    </b-form-group>
                    <b-form-group v-if="accountStore.account">
                        <template #label>
                            <div class="d-flex align-items-center">
                                <img
                                    v-b-tooltip
                                    title="Secured by Metamask"
                                    v-if="isMetamaskAccount"
                                    :src="imgMetamaskLogo"
                                    width="15"
                                    height="15"
                                    style="border-radius: 3px"
                                    class="me-2"
                                    alt="Metamask Logo"
                                />
                                <img
                                    v-b-tooltip
                                    title="Secured by Web3Auth"
                                    v-if="!isMetamaskAccount"
                                    :src="imgWeb3AuthLogo"
                                    width="15"
                                    height="15"
                                    style="border-radius: 3px"
                                    class="me-2"
                                    alt="Web3Auth Logo"
                                />
                                Account Address
                            </div>
                        </template>
                        <code>{{ accountStore.account.address }}</code>
                    </b-form-group>
                    <b-form-group v-if="!isMetamaskAccount" :label="`Account Private Key (${currentKeyTreshold})`">
                        <b-input-group>
                            <b-form-input :value="privateKey" />
                            <b-input-group-append>
                                <b-button size="sm" variant="primary" @click="isPrivateKeyHidden = !isPrivateKeyHidden">
                                    <i v-if="isPrivateKeyHidden" class="fas fa-eye px-2"></i>
                                    <i v-else class="fas fa-eye-slash px-2"></i>
                                </b-button>
                                <b-button
                                    size="sm"
                                    variant="primary"
                                    v-clipboard:copy="authStore.privateKey"
                                    v-clipboard:success="onCopySuccess"
                                >
                                    <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                                    <i v-else class="fas fa-clipboard px-2"></i>
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>
                </b-tab>
                <b-tab title="Security" v-if="authStore.securityQuestion">
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
                </b-tab>
            </b-tabs>
        </b-form>
        <template #footer>
            <b-button class="w-100" variant="primary" @click="accountStore.isModalAccountShown = false">
                Close
            </b-button>
        </template>
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
import { fromWei } from 'web3-utils';
import imgSafeLogo from '../../assets/safe-logo.jpg';
import imgMetamaskLogo from '../../assets/metamask-logo.png';
import imgWeb3AuthLogo from '../../assets/web3auth-logo.jpeg';

export default defineComponent({
    name: 'BaseModalAccount',
    data() {
        return {
            imgSafeLogo,
            imgMetamaskLogo,
            imgWeb3AuthLogo,
            error: '',
            isCopied: false,
            isPrivateKeyHidden: true,
            question: '',
            password: '',
            passwordCheck: '',
            // mnemonic: '',
            isLoadingReset: false,
            isLoadingPasswordChange: false,
            isMigratingTokens: false,
            // isLoadingMnemonic: false,
            erc20TokenMigrationCount: 0,
            erc721TokenMigrationCount: 0,
            fromWei,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        ...mapStores(useWalletStore),
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
    watch: {
        'accountStore.isModalAccountShown'() {
            this.accountStore.getAccount();
            this.walletStore.getWallet();
        },
    },
    methods: {
        onCopySuccess() {
            this.isCopied = true;
        },
        async onShow() {
            this.password = '';
            this.passwordCheck = '';
            this.question = this.authStore.securityQuestion;
            this.accountStore.getAccount();
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
        // async onSubmitCreateMnemonic() {
        //     this.isLoadingMnemonic = true;
        //     const newShare = await tKey.generateNewShare();
        //     this.mnemonic = (await tKey.outputShare(newShare.newShareIndex, 'mnemonic')) as string;
        //     this.isLoadingMnemonic = false;
        // },
    },
});
</script>

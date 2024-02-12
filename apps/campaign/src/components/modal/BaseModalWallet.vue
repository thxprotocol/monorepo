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
            <b-tabs justified content-class="mt-3">
                <b-tab title="Wallet" active>
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
                    <b-form-group
                        v-if="wallet.variant === WalletVariant.Web3Auth"
                        :label="`Account Private Key (${currentKeyTreshold})`"
                    >
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
import imgSafeLogo from '../../assets/safe-logo.jpg';
import imgMetamaskLogo from '../../assets/metamask-logo.png';
import imgWeb3AuthLogo from '../../assets/web3auth-logo.jpeg';

export default defineComponent({
    name: 'BaseModalWallet',
    data() {
        return {
            isShown: false,
            walletLogoMap,
            imgSafeLogo,
            imgMetamaskLogo,
            imgWeb3AuthLogo,
            WalletVariant,
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

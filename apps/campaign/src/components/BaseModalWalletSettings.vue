<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @show="onShow"
        @hidden="$emit('hidden')"
        no-close-on-backdrop
        centered
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-key me-2"></i> Wallet Settings</h5>
            <b-link class="btn-close" @click="$emit('hidden')"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert v-if="error" show variant="danger" class="p-2">{{ error }}</b-alert>
            <b-form>
                <b-tabs justified content-class="mt-3">
                    <b-tab title="About">
                        <b-form-group v-if="walletStore.wallet?.safeVersion">
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
                        <b-form-group
                            v-if="!isMetamaskAccount"
                            label="Account Private Key"
                            :description="`This self-custody key is reconstructed from Login, Device and Backup key shares. (${currentKeyTreshold})`"
                        >
                            <b-input-group>
                                <b-form-input :value="privateKey" />
                                <b-input-group-append>
                                    <b-button
                                        size="sm"
                                        variant="primary"
                                        @click="isPrivateKeyHidden = !isPrivateKeyHidden"
                                    >
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
                    <b-tab title="Security Question" v-if="authStore.securityQuestion">
                        <b-form-group>
                            <b-form-input v-model="question" placeholder="Question" />
                        </b-form-group>
                        <b-form-group :state="isPasswordValid">
                            <b-form-input
                                :state="isPasswordValid"
                                v-model="password"
                                type="password"
                                placeholder="New answer"
                                autocomplete="off"
                            />
                        </b-form-group>
                        <b-form-group :state="isPasswordValid">
                            <b-form-input
                                :state="isPasswordValid"
                                v-model="passwordCheck"
                                type="password"
                                placeholder="New answer again"
                                autocomplete="off"
                            />
                        </b-form-group>
                        <b-button
                            :disabled="!password.length || !authStore.isDeviceShareAvailable"
                            class="w-100"
                            variant="primary"
                            @click="onSubmitDeviceSharePasswordUpdate"
                        >
                            <b-spinner small variant="light" v-if="isLoadingPasswordChange" />
                            <template v-else> Change Security Question </template>
                        </b-button>
                    </b-tab>
                    <!-- <b-tab title="Export">
                        <p>Store the twelve word sequence somewhere safe and use it to recover wallet access.</p>
                        <b-card bg-variant="dark" class="mb-3">
                            <strong v-if="mnemonic" style="font-size: 1.3rem">{{ mnemonic }}</strong>
                            <strong v-else>...</strong>
                        </b-card>
                        <b-alert v-if="mnemonic" variant="warning">Do not store your mnemonic on this device!</b-alert>
                        <b-button class="w-100" variant="primary" @click="onSubmitCreateMnemonic">
                            <b-spinner small variant="light" v-if="isLoadingMnemonic" />
                            <template v-else>Create Backup</template>
                        </b-button>
                    </b-tab> -->
                </b-tabs>
            </b-form>
        </template>
        <template #footer>
            <!-- <b-button class="w-100 text-danger" variant="link" @click="onSubmitResetAccount">
                <b-spinner small variant="light" v-if="isLoadingReset" />
                <template v-else> Reset Account </template>
            </b-button> -->
            <b-button class="w-100" variant="primary" @click="$emit('hidden')">Close</b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../stores/Auth';
import { useAccountStore } from '../stores/Account';
import { useWalletStore } from '../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { AccountVariant } from '../types/enums/accountVariant';
import imgSafeLogo from '../assets/safe-logo.jpg';
import imgMetamaskLogo from '../assets/metamask-logo.png';
import imgWeb3AuthLogo from '../assets/web3auth-logo.jpeg';
// import { tKey } from '../utils/tkey';

export default defineComponent({
    name: 'BaseModalWalletSettings',
    data() {
        return {
            imgSafeLogo,
            imgMetamaskLogo,
            imgWeb3AuthLogo,
            error: '',
            isShown: false,
            isCopied: false,
            isPrivateKeyHidden: true,
            question: '',
            password: '',
            passwordCheck: '',
            // mnemonic: '',
            isLoadingReset: false,
            isLoadingPasswordChange: false,
            // isLoadingMnemonic: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useWalletStore),
        privateKey() {
            if (!this.authStore.privateKey) return '';
            if (this.isPrivateKeyHidden) return this.authStore.privateKey.replace(/./g, '•');
            return this.authStore.privateKey;
        },
        currentKeyTreshold() {
            const { oAuthShare, isDeviceShareAvailable } = useAuthStore();

            let i = 0;
            if (oAuthShare) i++;
            if (isDeviceShareAvailable) i++;

            return `${i}/3`;
        },
        isMetamaskAccount() {
            if (!this.accountStore.account) return false;
            return this.accountStore.account.variant === AccountVariant.Metamask;
        },
        isSubmitDisabled: function () {
            return this.isLoading;
        },
        isPasswordValid: function () {
            if (this.password.length >= 10 && this.password === this.passwordCheck) return true;
            return undefined;
        },
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        show: {
            type: Boolean,
        },
        isLoading: {
            type: Boolean,
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
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

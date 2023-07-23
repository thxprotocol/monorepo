<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @show="onShow"
        @hidden="$emit('hidden')"
        no-close-on-backdrop
        centered
        hide-footer
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
                    <b-tab title="Key">
                        <div v-if="accountStore.account">
                            {{ accountStore.account.address }}
                        </div>
                        <b-form-group
                            :label="`Private Key`"
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
                        <b-button class="w-100 text-danger" variant="link" @click="onSubmitResetAccount">
                            <b-spinner small variant="light" v-if="isLoadingReset" />
                            <template v-else> Reset Key </template>
                        </b-button>
                    </b-tab>
                    <b-tab title="Security" v-if="authStore.securityQuestion">
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
                    <b-tab title="Recovery" active v-if="authStore.securityQuestion">
                        <b-form-group :label="authStore.securityQuestion">
                            <b-form-input
                                v-model="passwordRecovery"
                                type="password"
                                placeholder="Answer"
                                autocomplete="off"
                            />
                        </b-form-group>
                        <b-button
                            class="w-100"
                            variant="primary"
                            @click="onSubmitDeviceShareRecovery"
                            :disabled="!!authStore.isDeviceShareAvailable"
                        >
                            <b-spinner small variant="light" v-if="isLoadingPasswordRecovery" />
                            <template v-else> Recover Key </template>
                        </b-button>
                    </b-tab>
                </b-tabs>
            </b-form>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../stores/Auth';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWalletAccess',
    data() {
        return {
            error: '',
            isShown: false,
            isCopied: false,
            isPrivateKeyHidden: true,
            question: '',
            password: '',
            passwordCheck: '',
            passwordRecovery: '',
            isLoadingReset: false,
            isLoadingPasswordRecovery: false,
            isLoadingPasswordChange: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        privateKey() {
            if (!this.authStore.privateKey) return '';

            const key = this.authStore.privateKey;
            if (this.isPrivateKeyHidden) return key.replace(/./g, '•');
            return key;
        },
        currentKeyTreshold() {
            const { oAuthShare, isDeviceShareAvailable } = useAuthStore();

            let i = 0;
            if (oAuthShare) i++;
            if (isDeviceShareAvailable) i++;

            return `${i}/3`;
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
            this.passwordRecovery = '';
            this.question = this.authStore.securityQuestion;
        },
        async onSubmitDeviceSharePasswordUpdate() {
            const { oAuthShare, isDeviceShareAvailable, updateDeviceShare } = this.authStore;
            if (!oAuthShare || !isDeviceShareAvailable) return;

            this.isLoadingPasswordChange = true;
            await updateDeviceShare(this.password, this.question);
            this.isLoadingPasswordChange = false;
            this.password = '';
        },
        async onSubmitDeviceShareRecovery() {
            this.error = '';
            this.isLoadingPasswordRecovery = true;
            try {
                await this.authStore.recoverDeviceShare(this.passwordRecovery);
                this.passwordRecovery = '';
            } catch (error) {
                this.error = (error as Error).message;
            } finally {
                this.isLoadingPasswordRecovery = false;
            }
        },
        async onSubmitResetAccount() {
            this.isLoadingReset = true;
            await this.authStore.reset();
            this.isLoadingReset = false;
            this.passwordRecovery = '';
        },
    },
});
</script>

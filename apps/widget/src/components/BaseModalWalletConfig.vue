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
            <h5 class="modal-title"><i class="fas fa-bell me-2"></i> Wallet Config</h5>
            <b-link class="btn-close" @click="$emit('hidden')"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            OAuthShare: {{ !!accountStore.oAuthShare }}<br />
            Device Share: {{ accountStore.isDeviceShareAvailable }} <br />
            <b-input-group>
                <b-form-input :value="`0x${accountStore.privateKey}`" />
                <b-input-group-append>
                    <b-button
                        size="sm"
                        variant="primary"
                        v-clipboard:copy="`0x${accountStore.privateKey}`"
                        v-clipboard:success="onCopySuccess"
                    >
                        <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                        <i v-else class="fas fa-clipboard px-2"></i>
                    </b-button>
                </b-input-group-append>
            </b-input-group>
            <hr />
            <b-tabs justified content-class="mt-3">
                <b-tab title="Security Question" v-if="accountStore.securityQuestion">
                    <b-form-group>
                        <b-form-input v-model="question" placeholder="Question" />
                    </b-form-group>
                    <b-form-group :state="isPasswordValid">
                        <b-form-input
                            :state="isPasswordValid"
                            v-model="password"
                            type="password"
                            placeholder="New answer"
                        />
                    </b-form-group>
                    <b-form-group :state="isPasswordValid">
                        <b-form-input
                            :state="isPasswordValid"
                            v-model="passwordCheck"
                            type="password"
                            placeholder="New answer again"
                        />
                    </b-form-group>
                    <b-button
                        :disabled="!password.length || !accountStore.isDeviceShareAvailable"
                        class="w-100"
                        variant="primary"
                        @click="onSubmitDeviceSharePasswordUpdate"
                    >
                        <b-spinner size="sm" variant="light" v-if="isLoadingPasswordChange" />
                        <template v-else> Change Security Question </template>
                    </b-button>
                </b-tab>
                <b-tab title="Recover Key" active v-if="accountStore.securityQuestion">
                    <b-form-group :label="accountStore.securityQuestion">
                        <b-form-input v-model="passwordRecovery" type="password" placeholder="Answer" />
                    </b-form-group>
                    <b-button
                        class="w-100"
                        variant="primary"
                        @click="onSubmitDeviceShareRecovery"
                        :disabled="!!accountStore.isDeviceShareAvailable"
                    >
                        <b-spinner size="sm" variant="light" v-if="isLoadingPasswordRecovery" />
                        <template v-else> Recover Key </template>
                    </b-button>
                </b-tab>
            </b-tabs>
            <b-button class="w-100 text-danger" variant="link" @click="onSubmitResetAccount">
                <b-spinner size="sm" variant="light" v-if="isLoadingReset" />
                <template v-else> Reset Key </template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWalletAccess',
    data() {
        return {
            isShown: false,
            isCopied: false,
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
        error: {
            type: String,
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
            this.question = this.accountStore.securityQuestion;
        },
        async onSubmitDeviceSharePasswordUpdate() {
            const { isAuthenticated, isDeviceShareAvailable, updateDeviceShare } = this.accountStore;
            if (!isAuthenticated || !isDeviceShareAvailable) return;

            this.isLoadingPasswordChange = true;
            await updateDeviceShare(this.password, this.question);
            this.isLoadingPasswordChange = false;
            this.password = '';
        },
        async onSubmitDeviceShareRecovery() {
            this.isLoadingPasswordRecovery = true;
            await this.accountStore.recoverDeviceShare(this.passwordRecovery);
            this.isLoadingPasswordRecovery = false;
            this.passwordRecovery = '';
        },
        async onSubmitResetAccount() {
            this.isLoadingReset = true;
            await this.accountStore.reset();
            this.isLoadingReset = false;
            this.passwordRecovery = '';
        },
    },
});
</script>

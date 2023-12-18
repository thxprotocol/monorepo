<template>
    <b-modal
        v-model="walletStore.isModalWalletCreateShown"
        @show="onShow"
        @hidden="walletStore.isModalWalletCreateShown = false"
        centered
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-key me-2"></i> Complete account setup</h5>
        </template>
        <BaseFormGroupUsername :username="accountStore.account?.username" @error="isUsernameInvalid = !!$event" />
        <hr />
        <b-alert variant="warning" show class="p-2 px-3">
            <i class="fas fa-exclamation-circle me-2" />
            <span>Store your secret answer safely!</span>
        </b-alert>
        <b-alert v-model="isAlertShown" variant="info" class="p-2 px-3">
            <i class="fas fa-exclamation-circle me-2"></i>Unable to submit your security question.
            <p class="mb-0">
                <b-link @click="onSubmitReset">Reset recent attempts</b-link> or
                <b-link href="" target="_blank">Contact support</b-link>
            </p>
        </b-alert>
        <b-form-group description="This question will be asked when you sign in on another device.">
            <b-form-input v-model="question" placeholder="Question" />
        </b-form-group>
        <b-form-group :state="isPasswordLengthOK" :invalid-feedback="invalidFeedback">
            <b-form-input
                :state="isPasswordValid"
                v-model="password"
                type="password"
                placeholder="Answer"
                autocomplete="off"
            />
        </b-form-group>
        <b-form-group :state="isPasswordCheckLengthOK && isPasswordCheckEqualOK" :invalid-feedback="invalidFeedback">
            <b-form-input
                :state="isPasswordCheckLengthOK && isPasswordCheckEqualOK"
                v-model="passwordCheck"
                type="password"
                placeholder="Answer again"
                autocomplete="off"
            />
        </b-form-group>
        <template #footer>
            <b-button
                :disabled="!isPasswordValid || !authStore.isDeviceShareAvailable || isUsernameInvalid"
                class="w-100"
                variant="primary"
                @click="onSubmitDeviceSharePasswordCreate"
            >
                <b-spinner small variant="light" v-if="isLoadingPasswordCreate" />
                <template v-else> Set Security Question </template>
            </b-button>
            <b-button variant="link" class="w-100 text-white" @click="onClickSignout">
                <b-spinner small variant="light" v-if="isLoadingReset" />
                <template v-else>Sign out</template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWalletCreate',
    data() {
        return {
            username: '',
            question: '',
            password: '',
            passwordCheck: '',
            isCreateFailed: false,
            isLoadingPasswordCreate: false,
            isLoadingReset: false,
            isUsernameInvalid: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useWalletStore),
        isPasswordValid() {
            if (this.password.length >= 10 && this.password === this.passwordCheck) return true;
            if (this.password.length && this.password.length < 10) return false;
            return undefined;
        },
        isPasswordLengthOK() {
            if (this.password.length >= 10) return true;
            if (this.password.length && this.password.length < 10) return false;
            return null;
        },
        isPasswordCheckLengthOK() {
            if (this.passwordCheck.length >= 10) return true;
            if (this.passwordCheck.length && this.passwordCheck.length < 10) return false;
            return null;
        },
        isPasswordCheckEqualOK() {
            if (this.password && this.password === this.passwordCheck) return true;
            if (this.password.length && this.passwordCheck.length && this.password !== this.passwordCheck) return false;
            return null;
        },
        invalidFeedback() {
            if (this.isPasswordCheckEqualOK === false) return 'Passwords are not equal.';
            if (this.isPasswordLengthOK === false || this.isPasswordCheckLengthOK === false)
                return 'Use 10 or more characters.';
            return '';
        },
        invalidCheckFeedback() {
            //
        },
        isAlertShown() {
            return this.isCreateFailed || (this.isPasswordValid && !this.authStore.isDeviceShareAvailable);
        },
    },
    methods: {
        async onShow() {
            this.password = '';
            this.question = '';
        },
        async onSubmitDeviceSharePasswordCreate() {
            const { oAuthShare, isDeviceShareAvailable, createDeviceShare } = this.authStore;
            if (!oAuthShare || !isDeviceShareAvailable) return;

            this.isLoadingPasswordCreate = true;
            try {
                await createDeviceShare(this.question, this.password);
                this.isLoadingPasswordCreate = false;
                this.accountStore.isAuthenticated = true;
                this.walletStore.isModalWalletCreateShown = false;
            } catch (error) {
                this.isLoadingPasswordCreate = false;
                this.isCreateFailed = true;
                console.error(error);
            }
        },
        async onSubmitReset() {
            this.isLoadingReset = true;
            await this.authStore.resetKey();
            window.location.reload();
        },
        async onClickSignout() {
            await this.accountStore.signout();
            this.walletStore.isModalWalletCreateShown = false;
        },
    },
});
</script>

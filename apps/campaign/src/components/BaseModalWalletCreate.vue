<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @show="onShow"
        @hidden="$emit('hidden')"
        centered
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-key me-2"></i> Create Self-Custodial Wallet</h5>
        </template>
        <p>
            This question will be asked when you sign in on another device.
            <strong>Store your answer safely!</strong>
        </p>
        <b-alert v-model="isAlertShown" variant="info" class="p-2 px-3">
            <i class="fas fa-exclamation-circle me-2"></i>Unable to submit your security question.
            <p class="mb-0">
                <b-link @click="onSubmitReset">Reset recent attempts</b-link> or
                <b-link href="" target="_blank">Contact support</b-link>
            </p>
        </b-alert>
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
        <template #footer>
            <b-button
                :disabled="!isPasswordValid || !authStore.isDeviceShareAvailable"
                class="w-100"
                variant="primary"
                @click="onSubmitDeviceSharePasswordCreate"
            >
                <b-spinner small variant="light" v-if="isLoadingPasswordCreate" />
                <template v-else> Set Security Question </template>
            </b-button>
            <b-button variant="link" class="w-100 text-danger" @click="onSubmitReset">
                <b-spinner small variant="light" v-if="isLoadingReset" />
                <template v-else>Reset</template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore } from '../stores/Account';
import { useAuthStore } from '../stores/Auth';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWalletCreate',
    data() {
        return {
            isShown: false,
            question: '',
            password: '',
            passwordCheck: '',
            isCreateFailed: false,
            isLoadingPasswordCreate: false,
            isLoadingReset: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        isPasswordValid: function () {
            if (this.password.length >= 10 && this.password === this.passwordCheck) return true;
            if (this.password.length && this.password.length < 10) return false;
            return undefined;
        },
        isAlertShown() {
            return this.isCreateFailed || (this.isPasswordValid && !this.authStore.isDeviceShareAvailable);
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
    },
    watch: {
        show(value) {
            this.isShown = value;
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
                this.$emit('hidden');
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
    },
});
</script>

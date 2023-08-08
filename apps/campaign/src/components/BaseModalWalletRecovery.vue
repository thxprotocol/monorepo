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
            <h5 class="modal-title"><i class="fas fa-key me-2"></i> Wallet Recovery</h5>
            <b-link class="btn-close" @click="$emit('hidden')"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert v-model="isFailedRecovery" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
            </b-alert>
            <b-form>
                <b-form-group :label="authStore.securityQuestion">
                    <b-form-input v-model="passwordRecovery" type="password" placeholder="Answer" autocomplete="off" />
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
            </b-form>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../stores/Auth';
import { useAccountStore } from '../stores/Account';
import { useWalletStore } from '../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalWalletCreate',
    data() {
        return {
            error: '',
            isShown: false,
            question: '',
            passwordRecovery: '',
            isLoadingPasswordRecovery: false,
            isFailedRecovery: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useWalletStore),
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
        async onShow() {
            this.question = this.authStore.securityQuestion;
        },
        async onSubmitDeviceShareRecovery() {
            this.error = '';
            this.isLoadingPasswordRecovery = true;
            this.isFailedRecovery = false;
            try {
                await this.authStore.recoverDeviceShare(this.passwordRecovery);
                this.passwordRecovery = '';
                this.$emit('hidden');
            } catch (error) {
                this.error = (error as Error).message;
                this.isFailedRecovery = true;
            } finally {
                this.isLoadingPasswordRecovery = false;
            }
        },
    },
});
</script>

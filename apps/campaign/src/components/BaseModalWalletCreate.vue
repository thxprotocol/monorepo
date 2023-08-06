<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @show="onShow"
        @hidden="$emit('hidden')"
        centered
        hide-footer
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-bell me-2"></i> Create Wallet</h5>
            <!-- <b-link class="btn-close" @click="$emit('hidden')"> <i class="fas fa-times"></i> </b-link> -->
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <p>This question will be asked when you sign in on a different device.</p>
            <b-form-group>
                <b-form-input v-model="question" placeholder="Question" />
            </b-form-group>
            <b-form-group :state="isPasswordValid">
                <b-form-input :state="isPasswordValid" v-model="password" type="password" placeholder="Answer" />
            </b-form-group>
            <b-form-group :state="isPasswordValid">
                <b-form-input
                    :state="isPasswordValid"
                    v-model="passwordCheck"
                    type="password"
                    placeholder="Answer again"
                />
            </b-form-group>
            <b-button
                :disabled="!password.length || !authStore.isDeviceShareAvailable"
                class="w-100"
                variant="primary"
                @click="onSubmitDeviceSharePasswordCreate"
            >
                <b-spinner small variant="light" v-if="isLoadingPasswordCreate" />
                <template v-else> Set Security Question </template>
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
            isLoadingPasswordCreate: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
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
        async onShow() {
            this.password = '';
            this.mnemonic = '';
            this.question = this.authStore.securityQuestion;
        },
        async onSubmitDeviceSharePasswordCreate() {
            const { oAuthShare, isDeviceShareAvailable, createDeviceShare } = this.authStore;
            if (!oAuthShare || !isDeviceShareAvailable) return;

            this.isLoadingPasswordCreate = true;
            await createDeviceShare(this.question, this.password);
            this.isLoadingPasswordCreate = false;
            this.$emit('hidden');
        },
    },
});
</script>

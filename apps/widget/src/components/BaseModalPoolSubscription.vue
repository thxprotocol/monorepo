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
            <h5 class="modal-title"><i class="fas fa-bell me-2"></i> Reward notifications</h5>
            <b-link class="btn-close" @click="isShown = false"> <i class="fas fa-times"></i> </b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert variant="warning" show class="py-1 px-2" v-if="!accountStore.isAuthenticated">
                <i class="fas fa-exclamation-circle me-1"></i>
                Please sign in first!
            </b-alert>

            <b-alert variant="warning" show class="py-1 px-2" v-if="isSubscribed">
                <i class="fas fa-exclamation-circle me-1"></i>
                You are removing your reward notification subscription.
            </b-alert>

            <b-alert v-if="error" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
            </b-alert>
            <p>
                {{
                    !isSubscribed
                        ? `We will notify ${email} when new rewards become available!`
                        : `We will no longer send notifications to ${email}.`
                }}
            </p>
            <b-form-group v-if="!accountStore.account?.email" label="E-mail" :state="isEmailValid">
                <b-form-input v-model="email" type="email" :state="isEmailValid" />
            </b-form-group>
        </template>
        <template #footer>
            <b-button variant="primary" class="w-100 rounded-pill" :disabled="isSubmitDisabled" @click="onClickSubmit">
                {{ isSubscribed ? 'Unsubscribe' : 'Subscribe' }}
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalPoolSubscription',
    data() {
        return { isShown: false, email: '' };
    },
    computed: {
        ...mapStores(useAccountStore),
        isSubscribed: function () {
            const { subscription } = useAccountStore();
            return !!subscription;
        },
        isEmailValid: function () {
            return !!this.email;
        },
        isSubmitDisabled: function () {
            return this.isLoading || !this.isEmailValid;
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
        onShow() {
            this.email = this.accountStore.account?.email || '';
        },
        onChangeEmail(email: string) {
            this.email = email;
        },
        onClickSubmit() {
            this.$emit(this.isSubscribed ? 'unsubscribe' : 'subscribe', this.email);
        },
    },
});
</script>

<template>
    <b-form-group label="E-mail" :state="isValidEmail" :invalid-feedback="String(error)" class="mb-0">
        <b-input-group>
            <b-form-input
                v-model="value"
                @input="onInput"
                @change="onChange"
                :state="isValidEmail"
                placeholder="john@example.io"
            />
            <b-input-group-append v-if="isLoading">
                <b-button size="sm" variant="primary" class="px-3" :disabled="true">
                    <b-spinner small />
                </b-button>
            </b-input-group-append>
            <b-input-group-append v-if="isVerified">
                <b-button
                    size="sm"
                    :variant="accountStore.account?.isEmailVerified ? 'primary' : 'danger'"
                    class="px-3"
                    :disabled="true"
                >
                    <b-spinner small />
                </b-button>
            </b-input-group-append>
        </b-input-group>
    </b-form-group>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseFormGroupUsername',
    data() {
        return {
            value: '',
            error: '',
            debounce: 0,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isInvalidInput() {
            return !this.value || !this.value.length || this.value.length < 3 || !this.value.includes('@');
        },
        isValidEmail() {
            if (this.isInvalidInput || this.error.length) return false;
            return;
        },
        isVerified() {
            if (!this.accountStore.account) return;
            if (!this.accountStore.account.email) return;
            return this.accountStore.account.isEmailVerified;
        },
    },
    mounted() {
        if (!this.accountStore.account) return;
        this.value = this.accountStore.account.email;
    },
    methods: {
        reset() {
            this.isLoading = false;
            this.error = '';
        },
        onInput() {
            this.isLoading = true;
            clearTimeout(this.debounce);
            this.debounce = setTimeout(this.update, 1000) as any;
        },
        onChange() {
            if (this.isLoading) return;
            this.update();
        },
        async update() {
            if (this.isInvalidInput) {
                this.reset();
                return;
            }

            try {
                await this.accountStore.update({ email: this.value });
                this.error = '';
            } catch (error) {
                this.error = 'This email is not valid.';
            } finally {
                this.$emit('error', this.error);
                this.isLoading = false;
            }
        },
    },
});
</script>

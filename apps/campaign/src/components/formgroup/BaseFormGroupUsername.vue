<template>
    <b-form-group label="Choose a nickname" :state="!errorUsername" :invalid-feedback="errorUsername" class="mb-0">
        <b-input-group>
            <b-form-input :value="username" @input="updateUsername" placeholder="johndoe1337" :state="!errorUsername" />
            <b-input-group-append v-if="isLoadingUsername">
                <b-button size="sm" variant="primary" class="px-3" :disabled="true">
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
            error: '',
            errorUsername: '',
            debounce: 0,
            isLoadingUsername: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        platforms() {
            return {};
        },
        isErrorShown() {
            return !!this.error;
        },
    },
    props: {
        username: String,
    },
    methods: {
        updateUsername(username: string) {
            this.isLoadingUsername = true;
            clearTimeout(this.debounce);
            this.debounce = setTimeout(async () => {
                try {
                    await this.accountStore.api.account.patch({ username });
                    this.errorUsername = '';
                    this.$emit('error', '');
                } catch (error) {
                    this.errorUsername = 'This username is already in use.';
                    this.$emit('error', 'This username is already in use.');
                } finally {
                    if (this.accountStore.account) {
                        this.accountStore.account.username = username;
                    }
                    this.isLoadingUsername = false;
                }
            }, 1000) as any;
        },
    },
});
</script>

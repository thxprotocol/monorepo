<template>
    <b-form-group label="Login Method" :state="isValidAccountVariant">
        <b-form-select v-model="accountVariant" :state="isValidAccountVariant">
            <b-form-select-option :value="null" disabled> Choose a login method </b-form-select-option>
            <b-form-select-option v-for="variant of variants" :value="variant" :disabled="variant.disabled">
                {{ variant.label }}
                <template v-if="variant.message"> ({{ variant.message }}) </template>
            </b-form-select-option>
        </b-form-select>
    </b-form-group>
    <b-modal v-model="isShown" title="Please, confirm your new login method" centered>
        Are you sure you want to change your login method to
        <strong v-if="accountVariant">
            {{ accountVariant.label }}
        </strong>
        ?
        <template #footer>
            <b-button class="w-100" :disabled="!isValidAccountVariant" variant="primary" @click="onClickSubmit">
                <b-spinner v-if="isLoading" small />
                <template v-else> Confirm </template>
            </b-button>
            <b-button class="w-100" variant="link" @click="onClickCancel">Cancel</b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { AccountVariant } from '../../types/enums/accountVariant';
import { AccessTokenKind } from '../../types/enums/accessTokenKind';
import { OAuthRequiredScopes, getConnectionStatus } from '../../utils/social';

const NULL_METHOD = { label: 'None', value: null };
export default defineComponent({
    name: 'BaseFormGroupAccountVariant',
    data() {
        return {
            AccountVariant,
            accountVariant: NULL_METHOD,
            error: '',
            isLoading: false,
            isShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        variants() {
            if (!this.accountStore.account) return [];

            return [
                {
                    label: 'E-mail',
                    value: AccountVariant.EmailPassword,
                    getValidationResult: () => {
                        if (!this.accountStore.account) return;

                        const result = this.accountStore.account.isEmailVerified;
                        return { disabled: !result, message: !result && 'Verify your email first' };
                    },
                },
                {
                    label: 'Google',
                    value: AccountVariant.SSOGoogle,
                    getValidationResult: () => {
                        if (!this.accountStore.account) return;
                        const result = getConnectionStatus(
                            this.accountStore.account,
                            AccessTokenKind.Google,
                            OAuthRequiredScopes.GoogleAuth,
                        );
                        return { disabled: !result, message: !result && 'Connect your Google account first' };
                    },
                },
                {
                    label: 'Discord',
                    value: AccountVariant.SSODiscord,
                    getValidationResult: () => {
                        if (!this.accountStore.account) return;
                        const result = getConnectionStatus(
                            this.accountStore.account,
                            AccessTokenKind.Discord,
                            OAuthRequiredScopes.DiscordAuth,
                        );
                        return { disabled: !result, message: !result && 'Connect your Discord account first' };
                    },
                },
            ].map((item: any) => {
                return {
                    ...item,
                    ...item.getValidationResult(),
                };
            });
        },
        isValidAccountVariant() {
            if (!this.accountStore.account) return false;
            return this.accountVariant.value !== null && this.accountStore.account.variant === AccountVariant.Metamask;
        },
    },
    watch: {
        accountVariant({ value }: { value: AccountVariant }) {
            if ([AccountVariant.EmailPassword, AccountVariant.SSOGoogle, AccountVariant.SSODiscord].includes(value)) {
                this.isShown = true;
            }
        },
    },
    methods: {
        onClickCancel() {
            this.accountVariant = NULL_METHOD;
            this.isShown = false;
        },
        async onClickSubmit() {
            this.isLoading = true;
            try {
                await this.accountStore.api.request.patch('/v1/account', {
                    data: { variant: this.accountVariant.value },
                });
                await this.accountStore.getAccount();
            } catch (error) {
                this.error = error as string;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

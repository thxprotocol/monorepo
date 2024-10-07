<template>
    <div class="h-100">
        <b-container class="m-auto h-100" fluid>
            <b-row class="h-100">
                <b-col md="6" class="h-100 d-flex align-items-center justify-content-center flex-column bg-dark">
                    <div>
                        <b-img height="40" :src="imgLogo" />
                        <div>
                            <strong class="my-3 d-block font-weight-normal" :style="{ fontSize: '1.5rem' }">
                                Sign in to studio
                            </strong>
                        </div>
                        <b-card footer-class="p-3 d-flex justify-content-end" body-class="p-5 pb-4">
                            <b-form v-if="!isEmailSent" @submit.prevent="onSubmitSigninWithOTP">
                                <BaseFormGroup label="Use your e-mail" label-class="text-opaque">
                                    <b-form-input v-model="email" placeholder="yourname@example.com" />
                                </BaseFormGroup>
                                <b-button :disabled="!isEmailValid" variant="primary" type="submit" class="w-100">
                                    <b-spinner v-if="isLoadingOTP" small />
                                    <template v-else>
                                        Send one-time password
                                        <BaseIcon icon="chevron-right" class="ms-2" />
                                    </template>
                                </b-button>
                            </b-form>

                            <b-form v-else @submit.prevent="onSubmitVerifyOTP">
                                <BaseFormGroup label="Check your e-mail for password">
                                    <b-form-input v-model="otp" placeholder="******" />
                                </BaseFormGroup>
                                <b-button :disabled="!isOTPValid" variant="primary" type="submit" class="w-100">
                                    <b-spinner v-if="isLoadingOTPVerify" small />
                                    <template v-else>
                                        Verify one-time password
                                        <BaseIcon icon="chevron-right" class="ms-2" />
                                    </template>
                                </b-button>
                            </b-form>

                            <BaseHrOrSeparator />

                            <BaseFormGroup label="Use a trusted provider" label-class="text-opaque">
                                <div class="d-flex justify-content-between w-100 gap-2">
                                    <b-button
                                        v-for="provider of providers"
                                        variant="dark"
                                        :title="provider.title"
                                        class="p-2 px-3 rounded"
                                        @click="onClickSigninWithOAuth(provider.variant)"
                                    >
                                        <b-spinner v-if="isLoadingProvider == provider.kind" small />
                                        <BaseIcon v-else :icon="provider.kind" type="fab" style="font-size: 1rem" />
                                    </b-button>
                                </div>
                            </BaseFormGroup>

                            <template #footer>
                                <b-link
                                    class="ms-3 text-decoration-none text-opaque text-white"
                                    href="https://twinstory.io/support"
                                    target="_blank"
                                >
                                    Help
                                </b-link>
                                <b-link
                                    class="ms-3 text-decoration-none text-opaque text-white"
                                    href="https://thx.network/privacy-policy.pdf"
                                    target="_blank"
                                >
                                    Privacy
                                </b-link>
                                <b-link
                                    class="ms-3 text-decoration-none text-opaque text-white"
                                    href="https://thx.network/general-terms-and-conditions.pdf"
                                    target="_blank"
                                >
                                    Terms
                                </b-link>
                            </template>
                        </b-card>
                    </div>
                </b-col>
                <b-col
                    :style="{
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                    }"
                >
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { AccessTokenKind, AccountVariant } from '@thxnetwork/common/enums';
import imgLogo from '@thxnetwork/studio/assets/logo.png';
import { useAuthStore } from '@thxnetwork/studio/stores/Auth';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Login',
    data() {
        return {
            imgLogo,
            email: '',
            otp: '',
            error: '',
            providers: {
                [AccountVariant.SSOGoogle]: {
                    kind: AccessTokenKind.Google,
                    variant: AccountVariant.SSOGoogle,
                    title: 'Sign in with Google',
                },
                [AccountVariant.SSOTwitter]: {
                    kind: AccessTokenKind.Twitter,
                    variant: AccountVariant.SSOTwitter,
                    title: 'Sign in with Twitter',
                },
                [AccountVariant.SSODiscord]: {
                    kind: AccessTokenKind.Discord,
                    variant: AccountVariant.SSODiscord,
                    title: 'Sign in with Discord',
                },
                [AccountVariant.SSOTwitch]: {
                    kind: AccessTokenKind.Twitch,
                    variant: AccountVariant.SSOTwitch,
                    title: 'Sign in with Twitch',
                },
                [AccountVariant.SSOGithub]: {
                    kind: AccessTokenKind.Github,
                    variant: AccountVariant.SSOGithub,
                    title: 'Sign in with Github',
                },
            } as any,
            isLoadingProvider: null as null | AccountVariant,
            isLoadingOTP: false,
            isLoadingOTPVerify: false,
            isEmailSent: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore),
        isEmailValid() {
            return this.email.length > 0;
        },
        isOTPValid() {
            return this.otp.length === 6;
        },
    },
    methods: {
        async onSubmitSigninWithOTP() {
            this.isLoadingOTP = true;
            try {
                await this.authStore.signInWithOtp({ email: this.email });
                this.isEmailSent = true;
            } catch (error) {
                this.error = (error as Error).message;
            } finally {
                this.isLoadingOTP = false;
            }
        },
        async onSubmitVerifyOTP() {
            this.isLoadingOTPVerify = true;
            try {
                await this.authStore.verifyOtp({ email: this.email, token: this.otp });
                if (!this.authStore.session)
                    throw new Error('An issue occured while verifying one-time password. Please try again.');
            } catch (error) {
                this.error = (error as Error).message;
            } finally {
                this.isLoadingOTPVerify = false;
            }
        },
        async onClickSigninWithOAuth(variant: AccountVariant) {
            this.isLoadingProvider = this.providers[variant].kind;
            try {
                await this.authStore.signInWithOAuth({ variant });
            } catch (error) {
                this.error = (error as Error).message;
                this.isLoadingProvider = null;
            }
        },
    },
});
</script>

<template>
    <div class="h-100">
        <b-container class="m-auto h-100" fluid>
            <b-row class="h-100">
                <b-col md="6" class="h-100 d-flex align-items-center justify-content-center flex-column bg-light">
                    <div>
                        <b-img width="60" :src="imgLogo" fluid />
                        <div>
                            <strong class="my-3 d-block font-weight-normal" :style="{ fontSize: '1.5rem' }">
                                Sign in to studio
                            </strong>
                        </div>
                        <b-card footer-class="text-right small" body-class="p-5">
                            <b-alert show variant="primary">
                                <i class="fas fa-info-circle ml-0 mr-2" />
                                By continuing you accept TwinStory's
                                <b-link
                                    class="font-weight-bold"
                                    href="https://thx.network/general-terms-and-conditions.pdf"
                                    target="_blank"
                                >
                                    Terms &amp; Conditions
                                </b-link>
                                and
                                <b-link
                                    class="font-weight-bold"
                                    href="https://thx.network/privacy-policy.pdf"
                                    target="_blank"
                                >
                                    Privacy Policy
                                </b-link>
                                .
                            </b-alert>

                            <b-form v-if="!isEmailSent" @submit.prevent="onSubmitSigninWithOTP">
                                <BaseFormGroup label="Use your e-mail">
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
                                <BaseFormGroup label="Check your e-mail for the OTP">
                                    <b-form-input v-model="otp" placeholder="******" />
                                </BaseFormGroup>
                                <b-button :disabled="!isOTPValid" variant="primary" type="submit" class="w-100">
                                    <b-spinner v-if="isLoadingOTPVerify" small />
                                    <template v-else>
                                        Verify OTP
                                        <BaseIcon icon="chevron-right" class="ms-2" />
                                    </template>
                                </b-button>
                            </b-form>

                            <BaseHrOrSeparator />

                            <BaseFormGroup label="Use a trusted provider">
                                <b-button
                                    v-for="(provider, key) of providers"
                                    :key="key"
                                    variant="primary"
                                    :title="provider.title"
                                    class="me-2 p-2 px-3"
                                    @click="onClickSigninWithOAuth(provider.variant)"
                                >
                                    <b-spinner v-if="provider.isLoading" small />
                                    <BaseIcon
                                        v-else
                                        :icon="provider.kind"
                                        type="fab"
                                        class="m-0"
                                        style="font-size: 1rem"
                                    />
                                </b-button>
                            </BaseFormGroup>

                            <template #footer>
                                <b-link
                                    class="ms-1"
                                    href="https://discord.com/invite/thx-network-836147176270856243"
                                    target="_blank"
                                >
                                    Help
                                </b-link>
                                <b-link class="ms-1" href="https://thx.network/privacy-policy.pdf" target="_blank">
                                    Privacy
                                </b-link>
                                <b-link
                                    class="ms-1"
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
                    class="bg-primary"
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
import { defineComponent } from 'vue';
import imgLogo from '@thxnetwork/studio/assets/logo.jpg';
import { AccessTokenKind, AccountVariant } from '@thxnetwork/common/enums';
import { useAuthStore } from '@thxnetwork/studio/stores/Auth';
import { mapStores } from 'pinia';

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
                    isLoading: false,
                },
                [AccountVariant.SSOTwitter]: {
                    kind: AccessTokenKind.Twitter,
                    variant: AccountVariant.SSOTwitter,
                    title: 'Sign in with Twitter',
                    isLoading: false,
                },
                [AccountVariant.SSODiscord]: {
                    kind: AccessTokenKind.Discord,
                    variant: AccountVariant.SSODiscord,
                    title: 'Sign in with Discord',
                    isLoading: false,
                },
                [AccountVariant.SSOTwitch]: {
                    kind: AccessTokenKind.Twitch,
                    variant: AccountVariant.SSOTwitch,
                    title: 'Sign in with Twitch',
                    isLoading: false,
                },
                [AccountVariant.SSOGithub]: {
                    kind: AccessTokenKind.Github,
                    variant: AccountVariant.SSOGithub,
                    title: 'Sign in with Github',
                    isLoading: false,
                },
            } as any,
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
                if (!this.authStore.session) throw new Error('An issue occured while verifying OTP. Please try again.');
            } catch (error) {
                this.error = (error as Error).message;
            } finally {
                this.isLoadingOTPVerify = false;
            }
        },
        async onClickSigninWithOAuth(variant: AccountVariant) {
            this.providers[variant].isLoading = true;
            try {
                await this.authStore.signInWithOAuth({
                    variant,
                });
                if (!this.authStore.session) throw new Error('An issue occured while logging in. Please try again.');
            } catch (error) {
                this.error = (error as Error).message;
            } finally {
                this.providers[variant].isLoading = false;
            }
        },
    },
});
</script>

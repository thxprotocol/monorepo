<template>
    <b-form-group label="Connected" description="Connections used for signing in can not be disconnected!">
        <b-alert v-model="isErrorShown" show variant="danger" class="p-2">{{ error }}</b-alert>
        <template v-for="provider of providers">
            <div class="px-3 py-2 d-flex align-items-center">
                <strong class="me-auto">
                    <i :class="platformIconMap[provider.kind]" class="me-2" :style="{ color: provider.color }"></i>
                    {{ provider.label }}
                </strong>
                <b-spinner v-if="provider.isSubmitting" small />
                <template v-else>
                    <BButton
                        :disabled="provider.isDisabled"
                        @click="onClickDisconnect(provider.kind)"
                        variant="link"
                        class="text-danger text-decoration-none"
                        size="sm"
                        v-if="provider.isConnected"
                    >
                        Disconnect
                    </BButton>
                    <BButton @click="onClickConnect(provider)" variant="primary" size="sm" v-else> Connect </BButton>
                </template>
            </div>
            <hr class="my-1" />
        </template>
    </b-form-group>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { OAuthRequiredScopes, getConnectionStatus, kindAccountVariantMap, platformIconMap } from '../../utils/social';
import { AccessTokenKind } from '../../types/enums/accessTokenKind';

export default defineComponent({
    name: 'BaseFormGroupUsername',
    data() {
        return {
            error: '',
            isShown: false,
            isAlertShown: true,
            platformIconMap,
            AccessTokenKind,
            providers: {
                [AccessTokenKind.Google]: {
                    kind: AccessTokenKind.Google,
                    scopes: OAuthRequiredScopes.GoogleAuth,
                    label: 'YouTube',
                    color: '#FF0000',
                    isDisabled: true,
                    isConnected: false,
                    isSubmitting: false,
                },
                [AccessTokenKind.Twitter]: {
                    kind: AccessTokenKind.Twitter,
                    scopes: OAuthRequiredScopes.TwitterAuth,
                    label: 'Twitter',
                    color: '#1DA1F2',
                    isDisabled: true,
                    isConnected: false,
                    isSubmitting: false,
                },
                [AccessTokenKind.Discord]: {
                    kind: AccessTokenKind.Discord,
                    scopes: OAuthRequiredScopes.DiscordAuth,
                    color: '#7289DA',
                    label: 'Discord',
                    isDisabled: true,
                    isConnected: false,
                    isSubmitting: false,
                },
            } as any,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isErrorShown() {
            return !!this.error.length;
        },
    },
    props: {
        username: String,
    },
    mounted() {
        this.updateConnectionStatus();
    },
    methods: {
        async onClickConnect({ kind, scopes }: { kind: AccessTokenKind; scopes: TOAuthScope[] }) {
            this.error = '';
            this.providers[kind].isSubmitting = true;

            try {
                this.accountStore.connect(kind, scopes);
                await this.accountStore.waitForConnectionStatus(kind, scopes);
            } catch (error) {
                this.error = 'Could not connect provider.';
                console.error(error);
            } finally {
                this.updateConnectionStatus();
            }
        },
        async onClickDisconnect(kind: AccessTokenKind) {
            this.providers[kind].isSubmitting = true;
            try {
                await this.accountStore.disconnect(kind);
                await this.accountStore.getAccount();
            } catch (error) {
                this.error = 'Could not disconnect platform.';
                console.error(error);
            } finally {
                this.updateConnectionStatus();
            }
        },
        getPlatformConnectionDisabledStatus(account: TAccount, kind: AccessTokenKind) {
            return account.variant === kindAccountVariantMap[kind];
        },
        async updateConnectionStatus() {
            if (!this.accountStore.account) return;
            for (const kind of Object.keys(this.providers)) {
                const provider = this.providers[kind];
                this.providers[provider.kind].isDisabled = this.getPlatformConnectionDisabledStatus(
                    this.accountStore.account,
                    provider.kind,
                );
                this.providers[provider.kind].isConnected = getConnectionStatus(
                    this.accountStore.account as any,
                    provider.kind,
                    provider.scopes,
                );
                this.providers[provider.kind].isSubmitting = false;
            }
        },
    },
});
</script>

<template>
    <b-form-group>
        <b-alert v-model="isErrorShown" show variant="danger" class="p-2">{{ error }}</b-alert>
        <BaseFormGroupConnectedProvider v-for="provider of providers" :provider="provider" />
    </b-form-group>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { OAuthRequiredScopes, platformIconMap } from '../../utils/social';
import { AccessTokenKind } from '../../types/enums/accessTokenKind';

export default defineComponent({
    name: 'BaseFormGroupUsername',
    props: {
        username: String,
    },
    data() {
        return {
            error: '',
            isShown: false,
            isAlertShown: true,
            platformIconMap,
            AccessTokenKind,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isErrorShown() {
            return !!this.error.length;
        },
        providers() {
            return {
                [AccessTokenKind.Google]: {
                    kind: AccessTokenKind.Google,
                    scopes: OAuthRequiredScopes.GoogleAuth,
                    label: 'Google (YouTube)',
                    color: '#4285F4',
                },
                [AccessTokenKind.Twitter]: {
                    kind: AccessTokenKind.Twitter,
                    scopes: OAuthRequiredScopes.TwitterAuth,
                    label: 'Twitter',
                    color: '#1DA1F2',
                },
                [AccessTokenKind.Discord]: {
                    kind: AccessTokenKind.Discord,
                    scopes: OAuthRequiredScopes.DiscordAuth,
                    label: 'Discord',
                    color: '#7289DA',
                },
            };
        },
    },
});
</script>

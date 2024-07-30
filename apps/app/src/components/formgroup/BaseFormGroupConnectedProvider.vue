<template>
    <div class="d-flex align-items-center py-2">
        <strong>
            <i :class="platformIconMap[provider.kind]" class="me-2" :style="{ color: provider.color }"></i>
        </strong>
        <div class="me-auto">
            <strong>{{ provider.label }}</strong>
            <div v-if="identity" class="small">
                <span class="text-opaque">{{ identity.id }}</span>
                <i v-b-tooltip class="fas fa-question-circle ms-1 text-opaque" :title="`${provider.label} User ID`" />
            </div>
        </div>
        <b-spinner v-if="isLoading" small />
        <template v-else>
            <b-button
                v-if="identity"
                :disabled="isDisabled"
                variant="link"
                class="text-decoration-none text-primary"
                size="sm"
                @click="onClickDisconnect(provider.kind)"
            >
                Disconnect
            </b-button>
            <b-button v-else variant="primary" size="sm" @click="onClickConnect(provider)"> Connect </b-button>
        </template>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { kindAccountVariantMap, platformIconMap } from '../../utils/social';
import { AccessTokenKind } from '../../types/enums/accessTokenKind';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { UserIdentity } from '@supabase/supabase-js';

export default defineComponent({
    name: 'BaseFormGroupUsername',
    props: {
        provider: {
            type: Object as PropType<{
                kind: AccessTokenKind;
                scopes: string[];
                label: string;
                color: string;
            }>,
            required: true,
        },
    },
    data() {
        return {
            error: '',
            platformIconMap,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        isDisabled() {
            if (!this.accountStore.account || !this.identity) return true;
            return this.accountStore.account.variant === kindAccountVariantMap[this.identity.provider];
        },
        identity() {
            return this.accountStore.identities.find(
                (identity: UserIdentity) => identity.provider === this.provider.kind,
            );
        },
    },
    methods: {
        async onClickConnect({ kind, scopes }: { kind: AccessTokenKind; scopes: TOAuthScope[] }) {
            this.error = '';
            this.isLoading = true;
            try {
                await this.accountStore.connect(kind, scopes);
            } catch (error) {
                this.error = 'Could not connect provider.';
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },
        async onClickDisconnect(kind: AccessTokenKind) {
            this.error = '';
            this.isLoading = true;
            try {
                await this.accountStore.disconnect(kind);
            } catch (error) {
                this.error = 'Could not disconnect platform.';
                console.error(error);
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

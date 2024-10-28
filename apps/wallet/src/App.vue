<template>
    <div class="d-flex h-100 overflow-auto flex-column">
        <router-view />
    </div>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { WALLET_URL } from './config/secrets';
import { useAccountStore, useAuthStore } from './stores';

export default defineComponent({
    computed: {
        ...mapStores(useAccountStore, useAuthStore),
    },
    mounted() {
        window.onmessage = this.onMessage;
    },
    methods: {
        async onMessage(event: MessageEvent) {
            if (!this.accountStore.settings) return;

            const { domain } = this.accountStore.settings;
            const localOrigin = domain && new URL(domain).origin;
            const messageMap: { [message: string]: () => void } = {
                'tws.auth.callback': () => this.authStore.onSignedIn(event.data.session),
            };

            if ([localOrigin, WALLET_URL].includes(event.origin) && messageMap[event.data.message]) {
                messageMap[event.data.message]();
            }
        },
    },
});
</script>

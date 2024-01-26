<template>
    <div
        v-if="accountStore.config.domain && !isIframe"
        class="px-3 p-1 bg-dark text-white d-none d-lg-flex justify-content-between"
    >
        <b-link to="/" class="text-white text-opaque text-decoration-none">
            <i class="fas fa-caret-left me-1" />
            Back
        </b-link>
        <b-link :href="accountStore.config.domain" class="text-white text-opaque text-decoration-none">
            {{ decodeHTML(accountStore.config.title) }}
            <i v-if="!accountStore.config.active" class="fas fa-check-circle text-success" />
        </b-link>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { decodeHTML } from '../../utils/decode-html';

export default defineComponent({
    data() {
        return { decodeHTML, isIframe: window.self !== window.top };
    },
    computed: {
        ...mapStores(useAccountStore),
        domain() {
            if (!this.accountStore.config.domain) return;
            return new URL(this.accountStore.config.domain).hostname;
        },
    },
});
</script>

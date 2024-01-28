<template>
    <div
        v-if="accountStore.config.domain && !isIframe"
        style="height: 30px"
        class="px-3 p-1 bg-dark text-white d-none d-lg-flex justify-content-between"
    >
        <b-link to="/" class="text-white text-opaque text-decoration-none">
            <i class="fas fa-caret-left me-1" />
            Back
        </b-link>
        <b-link @click="isModalExternalURLShown = true" class="text-white text-opaque text-decoration-none">
            {{ domain }}
            <i v-if="!accountStore.config.active" class="fas fa-check-circle text-success" />
        </b-link>
        <BaseModalExternalURL
            :show="isModalExternalURLShown"
            @hidden="isModalExternalURLShown = false"
            :url="accountStore.config.domain"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { decodeHTML } from '../../utils/decode-html';
import BaseModalExternalURL from '../../components/modal/BaseModalExternalURL.vue';

export default defineComponent({
    components: {
        BaseModalExternalURL,
    },
    data() {
        return { decodeHTML, isIframe: window.self !== window.top, isModalExternalURLShown: false };
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

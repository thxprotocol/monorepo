<template>
    <div
        v-if="accountStore.config.domain && !isIframe"
        style="height: 30px"
        class="nav-top px-3 p-1 bg-dark text-white d-none d-lg-flex justify-content-between"
    >
        <b-link to="/" class="text-white text-opaque text-decoration-none">
            <i class="fas fa-caret-left me-1" />
            Back
        </b-link>
        <b-link class="text-white text-opaque text-decoration-none" @click="isModalExternalURLShown = true">
            {{ domain }}
            <i v-if="!accountStore.config.active" class="fas fa-check-circle text-success" />
        </b-link>
        <BaseModalExternalURL
            :show="isModalExternalURLShown"
            :url="accountStore.config.domain"
            @hidden="isModalExternalURLShown = false"
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
<style>
.nav-top ~ .d-flex > .h-vertical ~ .sidebar {
    height: calc(100% - 30px) !important;
}
</style>

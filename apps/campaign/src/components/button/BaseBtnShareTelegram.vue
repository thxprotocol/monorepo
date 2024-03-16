<template>
    <b-button size="sm" class="btn-share" @click="openShareWindow">
        <i class="fab fa-telegram" />
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { createPopupWindow } from '../../utils/popup';

export default defineComponent({
    name: 'BaseBtnShareTelegram',
    props: {
        url: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    methods: {
        openShareWindow() {
            const url = new URL('https://telegram.me');
            url.pathname = 'share/url';
            url.searchParams.append('url', this.url);
            url.searchParams.append('text', this.text);
            return window.open(url, '', createPopupWindow(640, 450));
        },
    },
});
</script>
<style scoped lang="scss">
.btn {
    background-color: #0088cc;
    &:hover {
        background-color: darken(#0088cc, 10%);
    }
}
</style>

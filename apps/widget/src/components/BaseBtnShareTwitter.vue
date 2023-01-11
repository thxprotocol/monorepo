<template>
    <b-button variant="light" size="sm" @click="openShareWindow">
        <i class="fab fa-twitter"></i>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { createPopupWindow } from '../utils/popup';

export default defineComponent({
    name: 'BaseBtnShareTwitter',
    props: {
        url: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: false,
        },
    },
    methods: {
        openShareWindow() {
            const url = new URL('https://twitter.com');
            url.pathname = 'share';
            url.searchParams.append('url', this.url);
            if (this.text) {
                url.searchParams.append('text', this.text);
            }
            window.open(url, 'Share this', createPopupWindow(640, 450));
        },
    },
});
</script>

<template>
    <b-button variant="light" size="sm" @click="openShareWindow">
        <i class="fab fa-linkedin"></i>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { createPopupWindow } from '../utils/popup';

export default defineComponent({
    name: 'BaseBtnShareLinkedin',
    props: {
        url: {
            type: String,
            required: true,
        },
    },
    methods: {
        openShareWindow() {
            const url = new URL('https://www.linkedin.com');
            url.pathname = 'feed';
            url.searchParams.append('shareActive', 'true');
            url.searchParams.append('shareUrl', this.url);
            window.open(url, 'Share this', createPopupWindow(640, 450));
        },
    },
});
</script>

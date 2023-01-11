<template>
    <b-button variant="light" size="sm" @click="openShareWindow">
        <i class="fab fa-whatsapp"></i>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseBtnShareWhatsapp',
    props: {
        url: {
            type: String,
            required: true,
        },
    },
    methods: {
        openShareWindow() {
            const url = new URL('https://api.whatsapp.com');
            url.searchParams.append('text', encodeURIComponent(this.url));
            return window.open(url);
        },
    },
});
</script>

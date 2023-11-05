<template>
    <b-button size="sm" class="btn-share" @click="openShareWindow">
        <i class="fas fa-envelope"></i>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseBtnShareEmail',
    props: {
        url: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
    },
    methods: {
        openShareWindow() {
            let url = 'mailto:friend@example.com';
            url = url.concat(`?subject=${encodeURIComponent(this.subject)}`);
            url = url.concat(`&body=${encodeURIComponent(this.url)}`);
            return window.open(url);
        },
    },
});
</script>
<style scoped lang="scss">
.btn {
    background-color: gray;

    &:hover {
        background-color: darken(gray, 10%);
    }
}
</style>

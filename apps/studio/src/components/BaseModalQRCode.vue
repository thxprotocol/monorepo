<template>
    <b-modal
        :id="id"
        centered
        hide-footer
        hide-header
        body-class="d-flex justify-content-center"
        @hidden="$emit('close')"
    >
        code
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import imgLogo from '@thxnetwork/studio/assets/logo.jpg';

export default defineComponent({
    name: 'BaseModalQRCode',
    props: {
        id: String,
        url: String,
    },
    data() {
        return { imgLogo, isShown: false };
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        //
    },
});
</script>

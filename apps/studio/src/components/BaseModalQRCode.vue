<template>
    <b-modal
        :id="id"
        centered
        hide-footer
        hide-header
        body-class="d-flex justify-content-center"
        @hidden="$emit('close')"
    >
        <QRCodeVue3
            :qr-options="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
            :width="380"
            :height="380"
            :value="url"
            :image="imgLogo"
            :image-options="{ hideBackgroundDots: true, imageSize: 0.5, margin: 0 }"
            :dots-options="{ type: 'square', color: '#5942C1' }"
            :corners-square-options="{ type: 'square', color: '#5942C1' }"
            :corners-dot-options="{ type: undefined, color: '#5942C1' }"
            :background-options="{ color: '#ffffff' }"
        />
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import QRCodeVue3 from 'qrcode-vue3';
import imgLogo from '@thxnetwork/studio/assets/logo.jpg';

export default defineComponent({
    name: 'BaseModalQRCode',
    components: {
        QRCodeVue3,
    },
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

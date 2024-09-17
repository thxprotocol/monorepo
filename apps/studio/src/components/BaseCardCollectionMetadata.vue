<template>
    <b-card class="mb-3" :title="metadata.name" :img-src="metadata.imageUrl">
        <p>{{ metadata.description }}</p>
        <b-link :href="metadata.externalUrl" target="_blank" class="d-block">
            External URL
            <BaseIcon icon="external-link-alt ms-1" />
        </b-link>
        <template #footer>
            <b-button variant="primary" class="w-100" @click="isModelGenerateQRCodeShown = true">
                Generate QR Codes
                <BaseIcon icon="qrcode" class="ms-1" />
            </b-button>
            <b-modal
                v-model="isModelGenerateQRCodeShown"
                centered
                hide-header
                hide-footer
                @hidden="isModelGenerateQRCodeShown = false"
            >
                <BaseFormCollectionMetadataQRCodes :collection="collection" :metadata="metadata" />
            </b-modal>
        </template>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardTableHeader',
    props: {
        collection: {
            type: Object as PropType<TERC721>,
            required: true,
        },
        metadata: {
            type: Object as PropType<TERC721Metadata>,
            required: true,
        },
    },
    data() {
        return { isModelGenerateQRCodeShown: false };
    },
});
</script>

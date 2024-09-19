<template>
    <b-card :title="metadata.name" :img-src="metadata.imageUrl">
        {{ metadata.description }}

        <hr />

        <div v-for="{ key, value } of details" class="d-flex justify-content-between small mb-1">
            <span class="text-opaque me-auto">{{ key }}</span>
            <b-link v-if="value.url" :href="value.url">{{ value }}</b-link>
            <span v-else>{{ value }}</span>
        </div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardCollectible',
    props: {
        collectible: {
            type: Object as PropType<TERC721>,
            required: true,
        },
        metadata: {
            type: Object as PropType<TERC721Metadata>,
            required: true,
        },
    },
    computed: {
        details() {
            return [
                { key: 'Collection', value: this.collectible.name },
                { key: 'Symbol', value: this.collectible.symbol },
                { key: 'Chain ID', value: this.collectible.chainId },
                { key: 'Address', value: `${this.collectible.address?.substring(0, 10)}...` },
                {
                    key: 'External URL',
                    value: `${new URL(this.metadata.externalUrl).pathname.substring(0, 25)}`,
                    url: this.metadata.externalUrl,
                },
            ];
        },
    },
    mounted() {
        //
    },
});
</script>

<template>
    {{ metadata.description }}
    <hr />
    <div v-for="{ key, value, url } of details" class="d-flex justify-content-between small mb-1">
        <span class="text-opaque me-auto">{{ key }}</span>
        <b-link v-if="url" target="_blank" :href="url">{{ value }}</b-link>
        <span v-else>{{ value }}</span>
    </div>
</template>

<script lang="ts">
import { chainList } from '@thxnetwork/common/chains';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardBodyCollectible',
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
    computed: {
        details() {
            return [
                {
                    key: 'Collection',
                    value: this.collection.name || '',
                    url: chainList[this.collection.chainId].blockExplorer + '/token/' + this.collection.address,
                },
                {
                    key: 'Symbol',
                    value: this.collection.symbol || '',
                },
                {
                    key: 'Chain',
                    value: `${chainList[this.collection.chainId].name} (${this.collection.chainId})` || '',
                },
                {
                    key: 'External URL',
                    value: this.metadata.externalUrl
                        ? `${new URL(this.metadata.externalUrl).pathname.substring(0, 25)}`
                        : '',
                    url: this.metadata.externalUrl || '',
                },
            ];
        },
    },
    mounted() {
        //
    },
});
</script>

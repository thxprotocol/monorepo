<template>
    <b-card header-class="p-0" no-body class="mb-2">
        <template #header>
            <b-button
                variant="primary"
                class="d-flex align-items-center rounded w-100 text-start"
                @click="isCollapsed = !isCollapsed"
            >
                <b-badge class="p-2 me-3" variant="light">
                    {{ collectible.nft.symbol }}
                    <BaseIcon icon="hashtag" class="ms-2" />
                    {{ collectible.tokenId }}
                </b-badge>
                {{ collection.name }}
                <BaseIcon :icon="isCollapsed ? 'caret-up' : 'caret-down'" class="ms-auto me-1" />
            </b-button>
        </template>
        <b-collapse v-model="isCollapsed">
            <div class="p-3">
                <b-img class="rounded mb-3" :src="metadata.imageUrl" fluid />
                <h2>{{ metadata.name }}</h2>
                <BaseCardBodyCollectible :metadata="metadata" :collection="collection" />
                <hr />
                <div class="small text-opaque text-center">
                    Collected at
                    {{ format(new Date(collectible.createdAt), 'yyyy-MM-dd HH:mm') }}
                </div>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { format } from 'date-fns';

export default defineComponent({
    name: 'BaseCardCollapseCollectible',
    props: {
        collection: {
            type: Object as PropType<TERC721>,
            required: true,
        },
        metadata: {
            type: Object as PropType<TERC721Metadata>,
            required: true,
        },
        collectible: {
            type: Object as PropType<TERC721Token>,
            required: true,
        },
    },
    data() {
        return { format, isLoading: false, isCollapsed: false };
    },
    computed: {
        details() {
            return [
                { key: 'Collection', value: this.collection.name || '' },
                { key: 'Symbol', value: this.collection.symbol || '' },
                { key: 'Chain ID', value: this.collection.chainId || '' },
                {
                    key: 'Address',
                    value: this.collection.address ? `${this.collection.address.substring(0, 10)}...` : '',
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

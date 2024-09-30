<template>
    <b-card header-class="p-0" no-body class="mb-2">
        <template #header>
            <b-button
                variant="primary"
                class="d-flex align-items-center rounded w-100 text-start"
                @click="isCollapsed = !isCollapsed"
            >
                <b-badge class="p-2 me-3" variant="light">
                    <b-spinner v-if="!collectible.tokenId" small />
                    <template v-else>
                        <BaseIcon icon="hashtag" />
                        {{ collectible.tokenId }}
                    </template>
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

                <div v-if="collectible.tokenId" class="d-flex justify-content-between small mb-1">
                    <span class="text-opaque me-auto">Token ID</span>
                    <b-link :href="url" target="_blank">{{ collectible.tokenId }}</b-link>
                </div>
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
import { chainList } from '@thxnetwork/common/chains';
import { format } from 'date-fns';
import { defineComponent, PropType } from 'vue';

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
        url() {
            return (
                chainList[this.collection.chainId].blockExplorer +
                '/nft/' +
                this.collection.address +
                '/' +
                this.collectible.tokenId
            );
        },
    },
    mounted() {
        //
    },
});
</script>

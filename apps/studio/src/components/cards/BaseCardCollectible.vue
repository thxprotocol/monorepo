<template>
    <b-card class="mb-3" :title="metadata.name" :img-src="metadata.imageUrl">
        <p>{{ metadata.description }}</p>
        <div class="d-flex">
            <b-badge class="p-2 me-2" variant="dark">
                <BaseIcon icon="qrcode" class="me-1" />
                {{ entries.total }}
            </b-badge>
            <b-badge class="p-2" variant="dark">
                <BaseIcon icon="users" class="me-1" />
                {{ entries.meta.claimedCount }}
            </b-badge>
            <b-button variant="dark" size="sm" :href="metadata.externalUrl" target="_blank" class="ms-auto">
                <BaseIcon icon="external-link-alt" />
            </b-button>
        </div>
        <template #footer>
            <b-button variant="primary" class="w-100" @click="isModelGenerateQRCodeShown = true">
                Create QR Codes
                <BaseIcon icon="chevron-right" class="ms-1" />
            </b-button>
            <b-modal
                v-model="isModelGenerateQRCodeShown"
                centered
                hide-header
                hide-footer
                body-class="gradient-shadow-xl"
                @hidden="isModelGenerateQRCodeShown = false"
            >
                <BaseFormCollectionMetadataQRCodes :collection="collection" :metadata="metadata" />
            </b-modal>
            <b-button
                v-b-modal="`modalRemoveCollectible${metadata._id}`"
                variant="link"
                class="text-danger w-100 text-decoration-none"
            >
                Remove
            </b-button>
            <BaseModalDelete
                :id="`modalRemoveCollectible${metadata._id}`"
                title="Remove Collectible"
                @delete="onClickRemove"
            >
                <p class="m-0">
                    Are you sure you want to remove this collectible and all it's QR code entries? This action cannot be
                    undone. Note that minted collectibles can not be removed!
                </p>
                <template #btn-content>
                    <b-spinner v-if="isLoading" small />
                    <template v-else> Remove </template>
                </template>
            </BaseModalDelete>
        </template>
    </b-card>
</template>

<script lang="ts">
import { useCollectionStore, useEntryStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardCollectible',
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
        return {
            isModalRemoveShown: false,
            isLoading: false,
            page: 1,
            limit: 10,
            query: '',
            isModelGenerateQRCodeShown: false,
        };
    },
    computed: {
        ...mapStores(useEntryStore, useCollectionStore),
        entries() {
            if (!this.entryStore.entriesByMetadata[this.metadata._id])
                return { total: 0, results: [], meta: { claimedCount: 0 } };
            return this.entryStore.entriesByMetadata[this.metadata._id];
        },
    },
    mounted() {
        this.listEntries();
    },
    methods: {
        async listEntries() {
            try {
                this.isLoading = true;
                await this.entryStore.list({
                    page: this.page,
                    limit: this.limit,
                    query: this.query,
                    erc721MetadataId: this.metadata._id,
                });
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async onClickRemove() {
            try {
                this.isLoading = true;
                await this.collectionStore.removeMetadata(this.collection._id, this.metadata._id);
                this.isModalRemoveShown = false;
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

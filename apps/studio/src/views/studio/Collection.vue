<template>
    <b-container class="py-5 text-white">
        <h1>{{ isCreating ? 'Create' : 'Configure' }} Collection</h1>
        <p class="lead">Design your personal NFT collections</p>
        <b-button v-if="collection.address" variant="dark" target="_blank" :href="blockExplorerURL">
            Open Block Explorer URL
            <BaseIcon icon="external-link-alt ms-1" />
        </b-button>
    </b-container>
    <div class="bg-dark text-white py-5 flex-grow-1">
        <b-container>
            <h2>Details</h2>
            <b-card class="mb-5">
                <b-form @submit="onSubmit">
                    <b-row>
                        <b-col md="6">
                            <BaseFormGroup label="Name" tooltip="This name is used to describe your collection">
                                <b-form-input v-model="name" :disabled="!isCreating" />
                            </BaseFormGroup>
                            <BaseFormGroup label="Symbol" tooltip="ERC721 collections require a symbol like ABC.">
                                <b-form-input v-model="symbol" :disabled="!isCreating" />
                            </BaseFormGroup>
                        </b-col>
                        <b-col md="6">
                            <BaseFormGroup label="Description" tooltip="Describe your collection in a couple of words">
                                <b-form-textarea v-model="description" />
                            </BaseFormGroup>
                            <b-button variant="primary" :disabled="isLoadingCollection" type="submit" class="w-100">
                                <b-spinner v-if="isLoadingCollection" small />
                                <template v-else> {{ isCreating ? 'Create' : 'Update' }} Collection </template>
                            </b-button>
                        </b-col>
                    </b-row>
                </b-form>
            </b-card>
            <h2 class="my-3 d-flex">
                Collectibles
                <b-button variant="primary" class="ms-auto" @click="isModelCollectionMetadataShown = true">
                    Create Collectible
                    <BaseIcon icon="plus" class="ms-1" />
                </b-button>
                <b-modal
                    v-model="isModelCollectionMetadataShown"
                    centered
                    hide-header
                    hide-footer
                    body-class="gradient-shadow-xl"
                    @hidden="isModelCollectionMetadataShown = false"
                >
                    <BaseFormCollectionMetadata :erc721="collection" @submit="isModelCollectionMetadataShown = false" />
                </b-modal>
            </h2>
            <b-row v-if="isLoading && !metadataList.length">
                <b-col v-for="val in [1]" md="3">
                    <b-placeholder-card :key="val" no-header :img-height="200" />
                </b-col>
            </b-row>
            <b-row v-else>
                <b-col v-for="metadata in metadataList" md="3">
                    <BaseCardCollectionMetadata :collection="collection" :metadata="metadata" />
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/common/enums';
import { useAuthStore, useCollectionStore, useEntryStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'NFT',
    data() {
        return {
            isLoading: false,
            isLoadingCollection: false,
            isModelCollectionMetadataShown: false,
            page: 1,
            limit: 10,
            name: '',
            description: '',
            symbol: '',
            address: '',
            chainId: ChainId.Polygon,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore, useEntryStore),
        isCreating(): boolean {
            return !this.$route.params.id;
        },
        blockExplorerURL() {
            switch (this.chainId) {
                case ChainId.Polygon:
                    return 'https://polygonscan.com/token/' + this.address;
                case ChainId.Linea:
                    return 'https://lineascan.build/token/' + this.address;
            }
        },
        collection(): TERC721 {
            return this.collectionStore.collections.find(
                (collection) => collection._id === this.$route.params.id,
            ) as TERC721;
        },
        metadataList(): TERC721Metadata[] {
            if (!this.collection || !this.collectionStore.metadata[this.collection._id]) return [];
            return this.collectionStore.metadata[this.collection._id].results || [];
        },
    },
    async mounted() {
        if (this.isCreating) return;

        const erc721Id = this.$route.params.id;
        await Promise.all([this.getCollection(erc721Id), this.listMetadata(erc721Id)]);

        this.name = this.collection.name;
        this.description = this.collection.description as string;
        this.symbol = this.collection.symbol as string;
        this.address = this.collection.address as string;
        this.chainId = this.collection.chainId as ChainId;
    },
    methods: {
        async getCollection(erc721Id: string) {
            try {
                this.isLoading = true;
                await this.collectionStore.get(erc721Id);
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async listMetadata(erc721Id: string) {
            try {
                this.isLoading = true;
                await this.collectionStore.listMetadata(erc721Id, { page: this.page, limit: this.limit });
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async onSubmit() {
            try {
                this.isLoadingCollection = true;
                await this.collectionStore[this.isCreating ? 'create' : 'update']({
                    _id: this.collection && this.collection._id,
                    name: this.name,
                    chainId: this.chainId,
                    symbol: this.symbol,
                    description: this.description,
                });
                this.$router.push(
                    `/collections/${this.collectionStore.collections[this.collectionStore.collections.length - 1]._id}`,
                );
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoadingCollection = false;
            }
        },
    },
});
</script>

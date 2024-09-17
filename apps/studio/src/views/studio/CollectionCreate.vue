<template>
    <b-container class="py-5 text-white">
        <h1>{{ isCreating ? 'Create' : 'Configure' }} Collection</h1>
        <p class="lead">Design your personal NFT collections</p>
        <b-button v-if="collection" variant="dark" target="_blank" :href="collection.blockExplorerURL">
            Open Block Explorer URL
            <BaseIcon icon="external-link-alt ms-1" />
        </b-button>
    </b-container>
    <div class="bg-dark text-white py-5">
        <b-container>
            <b-row>
                <b-col md="6">
                    <BaseFormGroup label="Name" tooltip="This name is used to describe your collection">
                        <b-form-input v-model="name" />
                    </BaseFormGroup>
                    <BaseFormGroup label="Symbol" tooltip="ERC721 collections require a symbol like ABC.">
                        <b-form-input v-model="description" />
                    </BaseFormGroup>
                </b-col>
                <b-col md="6">
                    <BaseFormGroup label="Description" tooltip="Describe your collection in a couple of words">
                        <b-form-textarea v-model="description" />
                    </BaseFormGroup>
                    <b-form @submit="onSubmit">
                        <b-button variant="primary" type="submit" class="w-100">
                            {{ isCreating ? 'Create' : 'Update' }} Collection
                        </b-button>
                    </b-form>
                </b-col>
            </b-row>
            <h2 class="my-3 d-flex">
                Metadata
                <b-button variant="dark" class="ms-auto" @click="isModelCollectionMetadataShown = true">
                    Create Metadata
                    <BaseIcon icon="plus" class="ms-1" />
                </b-button>
                <b-modal
                    v-model="isModelCollectionMetadataShown"
                    centered
                    hide-header
                    hide-footer
                    @hidden="isModelCollectionMetadataShown = false"
                >
                    <BaseFormCollectionMetadata :erc721="collection" />
                </b-modal>
            </h2>
            <b-row>
                <b-col v-for="metadata in metadataList" md="3">
                    <BaseCardCollectionMetadata :collection="collection" :metadata="metadata" />
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore, useCollectionStore } from '@thxnetwork/studio/stores';

export default defineComponent({
    name: 'NFT',
    data() {
        return {
            isLoading: false,
            isModelCollectionMetadataShown: false,
            page: 1,
            limit: 10,
            name: '',
            description: '',
            symbol: '',
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore),
        isCreating(): boolean {
            return !this.$route.params.id;
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
        await Promise.all([this.collectionStore.get(erc721Id), this.listMetadata(erc721Id)]);
        this.name = this.collection.name;
        this.description = this.collection.description as string;
        this.symbol = this.collection.symbol;
        this.address = this.collection.address;
    },
    methods: {
        async listMetadata(erc721Id: string) {
            await this.collectionStore.listMetadata(erc721Id, { page: this.page, limit: this.limit });
        },
        async onSubmit() {
            if (!this.isCreating) return;

            // await this.collectionStore.create({
            //     name: this.name,
            //     chainId: this.chainId,
            //     symbol: this.symbol,
            //     description: this.description,
            // });

            // Redirect to edit page
            this.$router.push(
                `/collections/${this.collectionStore.collections[this.collectionStore.collections.length - 1]._id}`,
            );
        },
    },
});
</script>

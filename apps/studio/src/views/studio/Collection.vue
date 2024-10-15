<template>
    <b-container class="py-5 text-white">
        <h1>{{ collection ? collection.name : 'New Collection' }}</h1>
        <p class="lead">{{ collection ? collection.description : 'Design your personal NFT collections' }}</p>
        <b-button v-if="collection && collection.address" variant="dark" target="_blank" :href="blockExplorerURL">
            Open Block Explorer URL
            <BaseIcon icon="external-link-alt ms-1" />
        </b-button>
    </b-container>
    <div class="bg-dark text-white py-5 flex-grow-1">
        <b-container>
            <b-alert v-model="isAlertWalletCreateShown" variant="warning" class="mb-3">
                <BaseIcon icon="exclamation-circle" class="me-2" />
                Please create a Safe multisig on this network to enable lazy minting.
                <b-link to="/" class="float-end text-decoration-none">
                    Go to overview <BaseIcon icon="chevron-right" class="ms-1" />
                </b-link>
            </b-alert>
            <b-alert v-model="isAlertMinterCreateShown" variant="warning" class="mb-3">
                <BaseIcon icon="exclamation-circle" class="me-2" />
                Please assign a Minter Role to the wallet to allow the wallet to mint collectibles.
                <b-link to="/" class="float-end text-decoration-none">
                    Go to overview <BaseIcon icon="chevron-right" class="ms-1" />
                </b-link>
            </b-alert>
            <h2 class="my-3">Details</h2>
            <b-card class="mb-5">
                <BaseFormCollection :collection="collection" />
            </b-card>
            <h2 v-if="collection" class="my-3 d-flex">
                Collectibles
                <b-button v-b-modal="'modalCollectibleCreate'" variant="primary" class="ms-auto">
                    Create Collectible
                    <BaseIcon icon="plus" class="ms-1" />
                </b-button>
                <BaseModalCollectibleCreate
                    :id="'modalCollectibleCreate'"
                    :collection="collection"
                    @hidden="listMetadata(collection._id)"
                />
            </h2>
            <b-spinner v-if="isLoading && !metadataList.length" small />
            <b-row v-else>
                <b-col v-for="metadata in metadataList" md="3">
                    <BaseCardCollectible :collection="collection" :metadata="metadata" />
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/common/enums';
import { useAuthStore, useCollectionStore, useEntryStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { useModal } from 'bootstrap-vue-next';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'NFT',
    data() {
        return { useModal, isLoading: false, page: 1, limit: 10 };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore, useEntryStore),
        isAlertWalletCreateShown() {
            return this.collection && (!this.collection.wallets || !this.collection.wallets.length);
        },
        isAlertMinterCreateShown() {
            return (
                this.collection &&
                this.collection.wallets &&
                this.collection.wallets.length &&
                (!this.collection.minters || !this.collection.minters.length)
            );
        },
        blockExplorerURL() {
            if (!this.collection) return '';
            switch (this.collection.chainId) {
                case ChainId.Polygon:
                    return 'https://polygonscan.com/token/' + this.collection.address;
                case ChainId.Linea:
                    return 'https://lineascan.build/token/' + this.collection.address;
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
        const erc721Id = this.$route.params.id;
        if (!erc721Id) return;

        await Promise.all([this.getCollection(erc721Id), this.getMinter(erc721Id), this.listMetadata(erc721Id)]);
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
        async getMinter(erc721Id: string) {
            try {
                this.isLoading = true;
                await this.collectionStore.getMinter(erc721Id);
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
    },
});
</script>

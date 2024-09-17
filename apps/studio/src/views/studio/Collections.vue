<template>
    <b-container class="py-5 text-white">
        <h1>Collections</h1>
        <p class="lead">Design custom NFT collections</p>
        <b-button variant="dark" to="/collections/create">
            Create Collection
            <BaseIcon icon="chevron-right" class="ms-2" />
        </b-button>
    </b-container>
    <div class="bg-dark text-white py-5 flex-grow-1">
        <b-container>
            <b-row v-if="isLoading && !collectionStore.collections.length">
                <b-col v-for="val in [1, 2, 3]" md="4">
                    <b-placeholder-card :key="val" no-img />
                </b-col>
            </b-row>
            <b-row v-else>
                <b-col v-for="collection of collectionStore.collections" md="4">
                    <b-link class="text-decoration-none" :to="`/collections/${collection._id}`">
                        <b-card class="mb-3" :header="collection.name">
                            {{ collection.description }}
                            <template #footer>
                                <b-button class="w-100" variant="primary">
                                    Configure
                                    <BaseIcon icon="chevron-right" class="ms-2" />
                                </b-button>
                            </template>
                        </b-card>
                    </b-link>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore, useCollectionStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';

export default defineComponent({
    name: 'Collection',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore),
    },
    mounted() {
        this.listCollections();
    },
    methods: {
        async listCollections() {
            try {
                this.isLoading = true;
                await this.collectionStore.list();
            } catch (error: any) {
                toast(error.message, 'danger', 3000, () => alert('bla'));
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>

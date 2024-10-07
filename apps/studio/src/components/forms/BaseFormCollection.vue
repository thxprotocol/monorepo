<template>
    <b-form @submit="onSubmit">
        <b-row>
            <b-col md="6">
                <BaseFormGroup label="Name" tooltip="This name is used to describe your collection">
                    <b-form-input v-model="name" :disabled="isDisabled" />
                </BaseFormGroup>
                <BaseFormGroup label="Symbol" tooltip="ERC721 collections require a symbol like ABC.">
                    <b-form-input v-model="symbol" :disabled="isDisabled" />
                </BaseFormGroup>
            </b-col>
            <b-col md="6">
                <BaseFormGroup label="Description" tooltip="Describe your collection in a couple of words">
                    <b-form-textarea v-model="description" />
                </BaseFormGroup>
                <b-button variant="primary" :disabled="isLoadingCollection" type="submit" class="w-100">
                    <b-spinner v-if="isLoadingCollection" small />
                    <template v-else> {{ isDisabled ? 'Update' : 'Create' }} Collection </template>
                </b-button>
            </b-col>
        </b-row>
    </b-form>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/common/enums';
import { useAuthStore, useCollectionStore, useEntryStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'NFT',
    props: {
        collection: { type: Object as PropType<TERC721>, required: true },
    },
    data() {
        return {
            isLoadingCollection: false,
            name: '',
            description: '',
            symbol: '',
            address: '',
            chainId: ChainId.Polygon,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore, useEntryStore),
        isDisabled(): boolean {
            return !!this.collection;
        },
    },
    watch: {
        collection: {
            handler(collection) {
                if (!collection) return;

                this.name = collection.name;
                this.description = collection.description as string;
                this.symbol = collection.symbol as string;
                this.address = collection.address as string;
                this.chainId = collection.chainId as ChainId;
            },
            immediate: true,
        },
    },
    methods: {
        async onSubmit() {
            try {
                this.isLoadingCollection = true;
                await this.collectionStore[!this.isDisabled ? 'create' : 'update']({
                    _id: this.collection && this.collection._id,
                    name: this.name,
                    chainId: this.chainId,
                    symbol: this.symbol,
                    description: this.description,
                });
                if (!this.collection) {
                    this.$router.push(
                        `/collections/${
                            this.collectionStore.collections[this.collectionStore.collections.length - 1]._id
                        }`,
                    );
                }
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

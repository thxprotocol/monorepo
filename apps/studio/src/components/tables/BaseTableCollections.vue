<template>
    <b-table
        responsive="lg"
        show-empty
        :items="collections"
        :tbody-tr-class="rowClass"
        :busy="isLoading"
        @row-clicked="onClickRow"
    >
        <template #head(name)>Name</template>
        <template #head(address)>Address</template>
        <template #head(actions)></template>
        <template #cell(chain)="{ item }">
            <b-img :src="item.chain.logo" width="20" alt="" />
        </template>
        <template #cell(name)="{ item }">
            <strong>{{ item.name }}</strong>
        </template>
        <template #cell(address)="{ item }">
            <b-link :href="item.address.url" target="_blank" class="text-decoration-none">
                <code>
                    {{ item.address.short }}
                    <BaseIcon icon="external-link-alt" />
                </code>
            </b-link>
        </template>
        <template #cell(minter)="{ item }">
            <BaseButtonWalletCreate
                v-if="!item.collection.wallets.length"
                :collection="item.collection"
                @submit="listCollections"
            />
            <BaseButtonMinterCreate
                v-if="!item.collection.minters.length"
                :collection="item.collection"
                :wallet="item.collection.wallets[0]"
                @submit="listCollections"
            />
            <b-link v-if="item.minter.long" :href="item.minter.url" target="_blank" class="text-decoration-none">
                <code>
                    {{ item.minter.short }}
                    <BaseIcon icon="external-link-alt" />
                </code>
            </b-link>
        </template>
        <template #cell(collection)="{ item }">
            <b-dropdown no-caret size="sm" end variant="link">
                <template #button-content>
                    <BaseIcon icon="ellipsis-v text-light" />
                </template>
                <b-dropdown-item v-b-modal="`modalCollectionRemove${item.collection._id}`"> Remove </b-dropdown-item>
                <BaseModalDelete
                    :id="`modalCollectionRemove${item.collection._id}`"
                    title="Remove Collection"
                    @delete="onClickDelete(item.collection._id)"
                >
                    <p>
                        Are you sure you want to remove this collection, all it's collectibles and QR code entries? This
                        action cannot be undone.
                    </p>
                    <p class="m-0 fw-bold">
                        Already minted collectibles can not be removed and will stay with the owners.
                    </p>
                    <template #btn-content>
                        <b-spinner v-if="isLoading" small />
                        <template v-else> Remove </template>
                    </template>
                </BaseModalDelete>
            </b-dropdown>
        </template>
    </b-table>
</template>

<script lang="ts">
import { useAccountStore, useAuthStore, useCollectionStore } from '@thxnetwork/studio/stores';
import { shortenAddress } from '@thxnetwork/studio/utils/address';
import { chainInfo } from '@thxnetwork/studio/utils/chains';
import { toast } from '@thxnetwork/studio/utils/toast';
import { useModal } from 'bootstrap-vue-next';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Collection',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore, useAccountStore),
        collections() {
            return this.collectionStore.collections.map((collection: any) => {
                return {
                    chain: {
                        logo: chainInfo[collection.chainId].logo,
                    },
                    name: collection.name,
                    address: {
                        url: collection.address
                            ? chainInfo[collection.chainId].blockExplorer + '/address/' + collection.address
                            : '',
                        long: collection.address,
                        short: collection.address ? shortenAddress(collection.address as `0x${string}`) : '',
                    },
                    minter: {
                        url: collection.minters.length
                            ? chainInfo[collection.chainId].blockExplorer + '/address/' + collection.minters[0]?.address
                            : '',
                        long: collection.minters.length ? collection.minters[0]?.address : '',
                        short: collection.minters.length
                            ? shortenAddress(collection.minters[0]?.address as `0x${string}`)
                            : '',
                    },
                    collection,
                };
            });
        },
    },
    mounted() {
        this.listCollections();
    },
    methods: {
        rowClass(_item: any, type: string) {
            return type === 'row' ? 'cursor-pointer' : '';
        },
        async listCollections() {
            try {
                this.isLoading = true;
                await this.collectionStore.list();
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
        async onClickDelete(id: string) {
            try {
                this.isLoading = true;
                await this.collectionStore.remove(id);
                useModal(`modalRemove${id}`).hide();
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = true;
            }
        },
        async onClickRow(item: any, _index: number, _event: MouseEvent) {
            try {
                this.isLoading = true;
                await this.$router.push(`/collections/${item.collection._id}`);
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

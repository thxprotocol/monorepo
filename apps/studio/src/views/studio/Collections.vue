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
            <b-card variant="darker">
                <b-table :items="collections" responsive="lg" :tbody-tr-class="rowClass" @row-clicked="onClickRow">
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
                        <b-link
                            v-if="item.minter.long"
                            :href="item.minter.url"
                            target="_blank"
                            class="text-decoration-none"
                        >
                            <code>
                                {{ item.minter.short }}
                                <BaseIcon icon="external-link-alt" />
                            </code>
                        </b-link>
                        <b-spinner
                            v-else
                            v-b-tooltip
                            small
                            title="Deploying your multisig and asigning it a minter role for this collection."
                        />
                    </template>
                    <template #cell(actions)="{ item }">
                        <b-dropdown no-caret size="sm" end variant="link">
                            <template #button-content>
                                <BaseIcon icon="ellipsis-v text-light" />
                            </template>
                            <b-dropdown-item v-b-modal="`modalRemove${item.actions.id}`"> Remove </b-dropdown-item>
                            <b-modal :id="`modalRemove${item.actions.id}`" centered title="Remove Collection">
                                <p>
                                    Are you sure you want to remove this collection, all it's collectibles and QR code
                                    entries? This action cannot be undone.
                                </p>
                                <p class="m-0 fw-bold">
                                    Note that minted collectibles can not be removed and will stay with the owners.
                                </p>
                                <template #footer>
                                    <b-button class="w-100" variant="danger" @click="onClickDelete(item.actions.id)">
                                        <b-spinner v-if="isLoading" small />
                                        <template v-else> Remove </template>
                                    </b-button>
                                </template>
                            </b-modal>
                        </b-dropdown>
                    </template>
                </b-table>
            </b-card>
        </b-container>
    </div>
</template>

<script lang="ts">
import { useAuthStore, useCollectionStore } from '@thxnetwork/studio/stores';
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
            useModal,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore),
        collections() {
            return this.collectionStore.collections.map((collection: TERC721 & { minters: TWallet[] }) => {
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
                    actions: {
                        id: collection._id,
                    },
                };
            });
        },
    },
    mounted() {
        this.listCollections();
    },
    methods: {
        rowClass(_item, type: string) {
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
                this.useModal(`modalRemove${id}`).hide();
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = true;
            }
        },
        async onClickRow(data: { actions: { id: string } }) {
            try {
                this.isLoading = true;
                await this.$router.push(`/collections/${data.actions.id}`);
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

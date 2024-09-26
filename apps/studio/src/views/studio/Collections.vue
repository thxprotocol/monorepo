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
                        <b-button
                            v-if="!item.collection.wallets.length"
                            size="sm"
                            variant="danger"
                            class="text-white"
                            :disabled="item.collection.isLoading"
                            @click.stop="onClickWalletCreate(item.collection)"
                        >
                            <b-spinner v-if="item.collection.isLoading" small />
                            <template v-else>
                                Add Wallet
                                <BaseIcon
                                    v-b-tooltip
                                    icon="question-circle"
                                    class="ms-1"
                                    title="Your collection needs a Safe multisig on this network to enable lazy minting of collectibles."
                                />
                            </template>
                        </b-button>
                        <b-button
                            v-if="item.collection.wallets.length && !item.collection.minters.length"
                            size="sm"
                            variant="danger"
                            class="text-white"
                            :disabled="item.collection.isLoading"
                            @click.stop="onClickMinterCreate(item.collection, item.collection.wallets[0])"
                        >
                            <b-spinner v-if="item.collection.isLoading" small />
                            <template v-else>
                                Add Minter
                                <BaseIcon
                                    icon="question-circle"
                                    class="ms-1"
                                    title="Your Safe multisig requires the minter role for this collection."
                                />
                            </template>
                        </b-button>
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
                    </template>
                    <template #cell(collection)="{ item }">
                        <b-dropdown no-caret size="sm" end variant="link">
                            <template #button-content>
                                <BaseIcon icon="ellipsis-v text-light" />
                            </template>
                            <b-dropdown-item v-b-modal="`modalRemove${item.collection._id}`"> Remove </b-dropdown-item>
                            <b-modal :id="`modalRemove${item.collection._id}`" centered title="Remove Collection">
                                <p>
                                    Are you sure you want to remove this collection, all it's collectibles and QR code
                                    entries? This action cannot be undone.
                                </p>
                                <p class="m-0 fw-bold">
                                    Already minted collectibles can not be removed and will stay with the owners.
                                </p>
                                <template #footer>
                                    <b-button
                                        class="w-100"
                                        variant="danger"
                                        @click="onClickDelete(item.collection._id)"
                                    >
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
            useModal,
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore, useAccountStore),
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
        async onClickWalletCreate(collection: TERC721) {
            const index = this.collectionStore.collections.findIndex((c) => c._id === collection._id);
            try {
                this.collectionStore.collections[index].isLoading = true;
                await this.accountStore.createWallet({ chainId: collection.chainId });
                await this.listCollections();
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.collectionStore.collections[index].isLoading = false;
            }
        },
        async onClickMinterCreate(collection: TERC721, wallet: TWallet) {
            const index = this.collectionStore.collections.findIndex((c) => c._id === collection._id);
            try {
                this.collectionStore.collections[index].isLoading = true;
                await this.collectionStore.createMinter(collection._id, wallet._id);
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.collectionStore.collections[index].isLoading = false;
            }
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
        async onClickRow(data: { collection: TERC721 }) {
            try {
                this.isLoading = true;
                await this.$router.push(`/collections/${data.collection._id}`);
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

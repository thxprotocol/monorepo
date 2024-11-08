<template>
    <b-card header-class="p-0" no-body class="mb-2">
        <template #header>
            <b-button
                variant="primary"
                class="d-flex align-items-center rounded w-100 text-start"
                @click="isCollapsed = !isCollapsed"
            >
                <div class="me-3 text-opaque">
                    <b-spinner v-if="!collectible.tokenId" small />
                    <template v-else>
                        <BaseIcon icon="hashtag" />
                        {{ collectible.tokenId }}
                    </template>
                </div>
                {{ collection.name }}
                <BaseIcon :icon="isCollapsed ? 'caret-up' : 'caret-down'" class="ms-auto me-1" />
            </b-button>
        </template>
        <b-collapse v-model="isCollapsed">
            <div class="p-3">
                <b-img class="rounded mb-3" style="width: 100%" :src="metadata.imageUrl" fluid />
                <h2>{{ metadata.name }}</h2>
                <BaseCardBodyCollectible :metadata="metadata" :collection="collection" />
                <div v-if="collectible.tokenId" class="d-flex justify-content-between small mb-1">
                    <span class="text-opaque me-auto">Token ID</span>
                    <b-link :href="url" target="_blank">{{ collectible.tokenId }}</b-link>
                </div>
                <b-button variant="primary" class="w-100 my-3" @click="isModalTransferShown = true">
                    Transfer
                    <BaseIcon icon="chevron-right" class="ms-1" />
                </b-button>
                <b-modal v-model="isModalTransferShown" centered hide-footer title="Transfer">
                    <b-form @submit.prevent="onSubmitTransfer">
                        <BaseFormGroup label="Receiver" tooltip="Provide the address of the recipient.">
                            <b-form-input v-model="to" placeholder="0x0000..." />
                        </BaseFormGroup>
                        <b-button :disabled="isLoading" type="submit" variant="primary" class="w-100">
                            <b-spinner v-if="isLoading" small variant="primary" />
                            <template v-else>Transer</template>
                        </b-button>
                        <b-button variant="link" class="w-100" @click="isModalTransferShown = false">Cancel</b-button>
                    </b-form>
                </b-modal>
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
import { useCollectibleStore } from '@thxnetwork/wallet/stores';
import { format } from 'date-fns';
import { isAddress } from 'ethers/lib/utils';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { toast } from '../../utils/toast';

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
        return { to: '', format, isModalTransferShown: false, isLoading: false, isCollapsed: false };
    },
    computed: {
        ...mapStores(useCollectibleStore),
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

    methods: {
        async onSubmitTransfer() {
            this.isLoading = true;
            try {
                if (!isAddress(this.to)) {
                    throw new Error('Invalid receiver address');
                }

                await this.collectibleStore.transfer({
                    to: this.to,
                    erc721Id: this.collectible.erc721Id,
                    erc721TokenId: this.collectible._id,
                });
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

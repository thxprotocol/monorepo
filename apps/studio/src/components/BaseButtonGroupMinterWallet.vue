<template>
    <b-spinner v-if="!collection.wallets" small />
    <BaseButtonWalletCreate v-else-if="!collection.wallets.length" :collection="collection" @submit="$emit('submit')" />
    <BaseButtonMinterCreate
        v-else-if="collection.minters && !collection.minters.length"
        :collection="collection"
        :wallet="collection.wallets[0]"
        @submit="$emit('submit')"
    />
    <b-link v-else-if="minter" :href="minter.url" target="_blank" class="text-decoration-none">
        <code>
            {{ minter.short }}
            <BaseIcon icon="external-link-alt" />
        </code>
    </b-link>
    <b-spinner v-else small />
</template>

<script lang="ts">
import { chainInfo } from '@thxnetwork/studio/utils/chains';
import { toast } from '@thxnetwork/studio/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useCollectionStore } from '../stores';
import { shortenAddress } from '../utils/address';

export default defineComponent({
    name: 'BaseButtonGroupMinterWallet',
    props: {
        collection: { type: Object as PropType<TERC721>, required: true },
    },
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useCollectionStore),
        minter() {
            const { minters } = this.collection;
            if (!minters || !minters.length) return;

            return {
                url: minters.length
                    ? chainInfo[this.collection.chainId].blockExplorer + '/address/' + minters[0]?.address
                    : '',
                long: minters.length ? minters[0].address : '',
                short: minters.length ? shortenAddress(minters[0].address as `0x${string}`) : '',
            };
        },
    },
    mounted() {
        this.getMinter();
    },
    methods: {
        async getMinter() {
            try {
                this.isLoading = true;
                await this.collectionStore.getMinter(this.collection._id);
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

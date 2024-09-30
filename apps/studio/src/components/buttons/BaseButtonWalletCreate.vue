<template>
    <b-button size="sm" variant="danger" class="text-white" :disabled="isLoading" @click.stop="onClickWalletCreate">
        <b-spinner v-if="isLoading" small />
        <template v-else>
            <BaseIcon
                v-b-tooltip
                icon="exclamation-circle"
                class="me-1"
                title="Your collection needs a Safe multisig on this network to enable lazy minting of collectibles."
            />
            Add Wallet
        </template>
    </b-button>
</template>

<script lang="ts">
import { useAccountStore, useAuthStore, useCollectionStore } from '@thxnetwork/studio/stores';
import { toast } from '@thxnetwork/studio/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseButtonWalletCreate',
    props: {
        collection: { type: Object as PropType<TERC721>, required: true },
    },
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useCollectionStore, useAccountStore),
    },
    methods: {
        async onClickWalletCreate() {
            try {
                this.isLoading = true;
                await this.accountStore.createWallet({ chainId: this.collection.chainId });
                this.$emit('submit');
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

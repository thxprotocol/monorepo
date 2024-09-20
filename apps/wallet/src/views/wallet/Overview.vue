<template>
    <div
        v-if="!collectibleStore.collectibles.length"
        class="text-opaque h-100 align-items-center d-flex w-100 justify-content-center"
    >
        You have no collectibles yet!
    </div>

    <BaseCardCollapseCollectible
        v-for="collectible of collectibleStore.collectibles"
        :collection="collectible.nft as TERC721"
        :metadata="collectible.metadata"
        :collectible="collectible"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore, useWalletStore, useCollectibleStore } from '@thxnetwork/wallet/stores';
import { toast } from '@thxnetwork/wallet/utils/toast';

export default defineComponent({
    name: 'ViewWalletOverview',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useWalletStore, useCollectibleStore),
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                this.listCollectibles(wallet);
            },
            immediate: true,
        },
    },
    methods: {
        async listCollectibles(wallet: TWallet) {
            try {
                this.isLoading = true;
                await this.collectibleStore.list(wallet._id);
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

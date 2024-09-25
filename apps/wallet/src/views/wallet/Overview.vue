<template>
    <div
        v-if="!collectibleStore.collectibles.length"
        class="text-opaque h-100 align-items-center d-flex w-100 justify-content-center"
    >
        {{ authStore.isAuthenticated ? 'You have no collectibles yet!' : 'Log in to view your collectibles' }}
    </div>

    <BaseCardCollapseCollectible
        v-for="collectible of collectibleStore.collectibles"
        :collection="collectible.nft as TERC721"
        :metadata="collectible.metadata"
        :collectible="collectible"
    />

    <b-button v-if="authStore.isAuthenticated" variant="dark" class="mt-3 w-100" @click="listCollectibles">
        <b-spinner v-if="isLoading" small />
        <template v-else>
            Reload Collectibles
            <BaseIcon icon="sync-alt" class="ms-1" />
        </template>
    </b-button>
</template>

<script lang="ts">
import { useAuthStore, useCollectibleStore, useWalletStore } from '@thxnetwork/wallet/stores';
import { toast } from '@thxnetwork/wallet/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

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

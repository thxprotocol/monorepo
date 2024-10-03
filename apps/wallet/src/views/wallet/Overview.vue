<template>
    <b-card v-if="!authStore.isAuthenticated" :img-src="accountStore.settings?.backgroundImgURL || undefined">
        <p>{{ accountStore.settings?.description }}</p>
        <template #footer>
            <b-button class="w-100" variant="primary" @click="authStore.isModalLoginShown = true">
                Login
                <BaseIcon icon="chevron-right" class="ms-1" />
            </b-button>
        </template>
    </b-card>
    <template v-else>
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

        <b-button
            v-if="authStore.isAuthenticated"
            variant="link"
            class="text-decoration-none text-white mt-3 w-100"
            @click="listCollectibles"
        >
            <b-spinner v-if="isLoading" small />
            <template v-else>
                Reload Collectibles
                <BaseIcon icon="sync-alt" class="ms-1" />
            </template>
        </b-button>
    </template>
</template>

<script lang="ts">
import { useAccountStore, useAuthStore, useCollectibleStore, useWalletStore } from '@thxnetwork/wallet/stores';
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
        ...mapStores(useAuthStore, useAccountStore, useWalletStore, useCollectibleStore),
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                this.listCollectibles();
            },
            immediate: true,
        },
    },
    methods: {
        async listCollectibles() {
            try {
                this.isLoading = true;
                await this.collectibleStore.list();
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

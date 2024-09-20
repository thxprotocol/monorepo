<template>
    <p v-if="!collectibleStore.collectibles.length" class="text-opaque text-center">You have no collectibles yet!</p>
    <div v-for="collectible of collectibleStore.collectibles">
        {{ collectible }}
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore, useAccountStore, useCollectibleStore } from '@thxnetwork/wallet/stores';
import { toast } from '@thxnetwork/wallet/utils/toast';

export default defineComponent({
    name: 'ViewWalletOverview',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useAccountStore, useCollectibleStore),
    },
    watch: {
        'accountStore.wallet': {
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

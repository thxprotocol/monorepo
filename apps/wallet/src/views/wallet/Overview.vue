<template>
    <p v-if="!collectibleStore.collectibles.length" class="text-opaque">You have no collectibles yet!</p>
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
    mounted() {
        debugger;
        this.listCollectibles();
    },
    methods: {
        async listCollectibles() {
            try {
                if (!this.accountStore.wallet) {
                    throw new Error('Wallet not found');
                }

                const walletId = this.accountStore.wallet._id;
                await this.collectibleStore.list(walletId);
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            }
        },
    },
});
</script>

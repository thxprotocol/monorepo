<template>
    <b-spinner v-if="!entryStore.entry" small />
    <template v-else>
        <b-alert v-model="isCollected" variant="danger" class="p-2 px-3">
            <BaseIcon icon="exclamation-circle" class="me-2" />
            This collectible has been collected already.
        </b-alert>
        <b-card
            v-if="entryStore.erc721 && entryStore.metadata"
            :title="entryStore.metadata.name"
            :img-src="entryStore.metadata.imageUrl"
            class="mb-3"
        >
            <BaseCardBodyCollectible :collection="entryStore.erc721" :metadata="entryStore.metadata" class="mb-3" />
        </b-card>

        <b-button
            v-if="!authStore.isAuthenticated"
            variant="primary"
            class="w-100"
            @click="authStore.isModalLoginShown = true"
        >
            Continue to login
        </b-button>
        <b-button
            v-else-if="!walletStore.wallets.length"
            variant="primary"
            class="w-100"
            @click="walletStore.isModalWalletShown = true"
        >
            Connect Wallet
        </b-button>
        <b-button v-else variant="success" :disabled="isLoading || isCollected" class="w-100" @click="onClickCollect">
            <b-spinner v-if="isLoading" small />
            <template v-else-if="isCollected">Already collected!</template>
            <template v-else> Collect </template>
        </b-button>
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore, useEntryStore, useWalletStore } from '@thxnetwork/wallet/stores';
import { toast } from '@thxnetwork/wallet/utils/toast';

export default defineComponent({
    name: 'ViewWalletOverview',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useEntryStore, useWalletStore),
        isCollected() {
            return this.entryStore.entry ? !!this.entryStore.entry.sub : false;
        },
    },
    async mounted() {
        try {
            const uuid = this.$route.params.uuid;
            if (!uuid) throw new Error('Entry not found');

            this.isLoading = true;

            await this.entryStore.get(uuid);
        } catch (error: any) {
            toast(error.message, 'light', 3000, () => {
                return;
            });
        } finally {
            this.isLoading = false;
        }
    },

    methods: {
        async onClickCollect() {
            try {
                const uuid = this.$route.params.uuid;
                this.isLoading = true;
                await this.entryStore.collect(uuid);

                toast('Congratulations! This collectible has been added to your collection', 'light', 3000, () => {
                    this.$router.push({ name: 'overview' });
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

<template>
    <div class="d-flex h-100 flex-column align-items-center">
        <div>
            <b-spinner v-if="!entryStore.entry" small />
            <template v-else>
                <BaseCardCollectible
                    :collectible="entryStore.entry.erc721"
                    :metadata="entryStore.entry.metadata"
                    class="mb-3"
                />

                <b-button
                    v-if="!authStore.isAuthenticated"
                    variant="primary"
                    class="w-100"
                    @click="authStore.isModalLoginShown = true"
                >
                    Continue to login
                </b-button>
                <b-button v-else variant="success" class="w-100" @click="onClickCollect">Collect!</b-button>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore, useEntryStore } from '@thxnetwork/wallet/stores';
import { toast } from '@thxnetwork/wallet/utils/toast';

export default defineComponent({
    name: 'ViewWalletOverview',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useEntryStore),
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
        onClickCollect() {
            debugger;
        },
    },
});
</script>

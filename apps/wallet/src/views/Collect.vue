<template>
    {{ entry }}
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore, useEntryStore } from '@thxnetwork/wallet/stores';

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
        this.entryStore.get(uuid);
    },
    methods: {
        //
    },
});
</script>

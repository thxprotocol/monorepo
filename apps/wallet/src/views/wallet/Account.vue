<template>ViewWalletAccount</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore } from '@thxnetwork/wallet/stores';

export default defineComponent({
    name: 'ViewWalletOverview',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore),
    },
    async mounted() {
        //
    },
    methods: {
        //
    },
});
</script>

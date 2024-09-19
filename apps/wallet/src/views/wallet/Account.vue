<template>{{ accountStore.account }}</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore, useAccountStore } from '@thxnetwork/wallet/stores';

export default defineComponent({
    name: 'ViewWalletOverview',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useAccountStore),
    },
    mounted() {
        this.accountStore.get();
    },
    methods: {
        //
    },
});
</script>

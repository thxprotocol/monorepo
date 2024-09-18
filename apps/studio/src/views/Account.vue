<template>account</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useAccountStore } from '@thxnetwork/studio/stores';

export default defineComponent({
    name: 'Account',
    computed: {
        ...mapStores(useAccountStore),
    },
    async mounted() {
        await this.accountStore.get();
    },
});
</script>

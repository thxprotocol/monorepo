<template>logout</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore } from '@thxnetwork/studio/stores';

export default defineComponent({
    name: 'Logout',
    computed: {
        ...mapStores(useAuthStore),
    },
    async mounted() {
        await this.authStore.logout();
    },
});
</script>

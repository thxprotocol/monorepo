<template>
    <div v-if="accountStore.isAuthenticated" class="flex-grow-1 overflow-auto px-5 pt-3">Completed!</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';
import { useAccountStore } from '../stores/Account';

export default defineComponent({
    name: 'Checkout',
    components: {},
    data: function (): {
        error: string;
        isLoading: boolean;
    } {
        return { error: '', isLoading: false };
    },
    async mounted() {
        const uuid = this.$route.params.uuid as string;
        if (!uuid) return;

        debugger;

        this.isLoading = false;
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(usePerkStore),
    },
});
</script>

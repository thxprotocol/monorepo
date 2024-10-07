<template>
    <div class="d-flex align-items-center justify-content-center h-100">
        <b-spinner v-if="isLoading" variant="light" small />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAuthStore } from '@thxnetwork/wallet/stores';
import { toast } from '@thxnetwork/wallet/utils/toast';

export default defineComponent({
    name: 'Logout',
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAuthStore),
    },
    async mounted() {
        try {
            await this.authStore.logout();
            this.isLoading = false;
        } catch (error: any) {
            toast(error.message, 'light', 3000, () => {
                return;
            });
        } finally {
            this.isLoading = true;
        }
    },
});
</script>

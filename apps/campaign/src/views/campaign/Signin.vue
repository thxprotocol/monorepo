<template>
    <b-container class="d-flex flex-column align-items-center justify-content-center h-100">
        <b-spinner size="sm" />
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';

export default defineComponent({
    name: 'Signin',
    async mounted() {
        const { userManager } = useAuthStore();
        const user = await userManager.getUser();
        if (user) {
            this.$router.push({ name: 'quests' });
        } else {
            useAccountStore().signin();
        }
    },
});
</script>

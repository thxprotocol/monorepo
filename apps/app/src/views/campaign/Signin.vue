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
        const { signin } = useAccountStore();
        const user = await userManager.getUser();
        if (!user) return signin();

        this.redirect();
    },
    methods: {
        redirect() {
            const uuid = window.sessionStorage.getItem('thxClaimUuid');
            const path = { name: uuid ? 'collect' : 'quests', ...(uuid ? { params: { uuid } } : {}) };

            this.$router.push(path);
        },
    },
});
</script>

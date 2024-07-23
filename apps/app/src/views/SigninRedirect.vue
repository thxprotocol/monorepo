<template>You are now logged in!</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { supabase } from '../stores/Account';

export default defineComponent({
    name: 'ViewSigninRedirect',
    mounted() {
        // User is only redirected here using auth on an _blank page or popup
        supabase.auth.onAuthStateChange(async (event) => {
            // Wait until signed in and close the window
            if (event === 'SIGNED_IN') {
                window.close();
            }
        });
    },
});
</script>

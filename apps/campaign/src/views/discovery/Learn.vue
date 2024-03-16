<template>
    <b-container>
        <b-alert v-model="isAlertShown" variant="primary" class="mt-3 p-2">
            <i class="fas fa-exclamation-circle me-1" />
            Complete quests to learn about our new Campaign Discovery platform!
        </b-alert>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Learn',
    data() {
        return {
            isAlertShown: true,
        };
    },
});
</script>

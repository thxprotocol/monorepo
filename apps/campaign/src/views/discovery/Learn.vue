<template>
    <BaseCardHeader>
        <template #primary>
            <h1>
                Onboarding <br />
                Quest &amp; Rewards
            </h1>
            <p class="lead">Complete quests and earn rewards while you learn about THX Network!</p>
            <b-button variant="primary" class="px-5" disabled>Coming Soon!</b-button>
        </template>
    </BaseCardHeader>
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

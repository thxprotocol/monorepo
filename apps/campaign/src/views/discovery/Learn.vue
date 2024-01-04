<template>
    <b-container>
        <b-alert variant="primary" v-model="isAlertShown" class="mt-3">
            <i class="fas fa-exclamation-circle me-2" />
            Complete quests to learn about our new Campaign Discovery platform!
        </b-alert>
    </b-container>
    <div style="height: 750px" id="thx-custom-container"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { API_URL } from '../../config/secrets';
import { THXWidget } from '@thxnetwork/sdk';

export default defineComponent({
    name: 'Learn',
    data() {
        return {
            isAlertShown: true,
        };
    },
    mounted() {
        THXWidget.create({
            apiUrl: API_URL,
            campaignId: '6286444ba9838bc5ed9fe117',
            containerSelector: '#thx-custom-container',
        });
    },
});
</script>

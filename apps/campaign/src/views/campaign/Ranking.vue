<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1">
        <b-row>
            <b-col lg="10" offset-xl="1">
                <BaseQuestLeaderboard />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Ranking',
});
</script>

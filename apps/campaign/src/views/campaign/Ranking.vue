<template>
    <b-container>
        <b-row>
            <b-col lg="6" offset-xl="3">
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

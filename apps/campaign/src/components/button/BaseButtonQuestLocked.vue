<template>
    <b-button variant="primary" block class="w-100" disabled>
        <i class="fas fa-lock me-1" />
        Quest Locked
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseButtonQuestLocked',
    props: {
        quest: {
            type: Object,
            required: true,
        },
    },
    mounted() {
        // debugger;
    },
    methods: {
        open() {
            //
        },
    },
});
</script>

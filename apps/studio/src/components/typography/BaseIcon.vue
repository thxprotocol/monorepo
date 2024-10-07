<template>
    <i :class="`${type} fa-${icon}`" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseIcon',
    props: {
        type: {
            type: String,
            default: 'fas',
        },
        icon: {
            type: String,
            required: true,
        },
    },
});
</script>

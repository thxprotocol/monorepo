<template>
    <b-alert v-for="(error, key) of errors" v-model="isAlertShown" variant="primary" class="p-2">
        <b-button variant="link" class="py-0" size="sm" style="float: right" @click="$emit('close', key)">
            <i class="fas fa-times" />
        </b-button>
        <i class="fas fa-exclamation-circle me-1" />
        {{ error }}
    </b-alert>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseAlertErrorList',
    props: {
        errors: { type: Array as PropType<string[]>, required: true },
    },
    computed: {
        isAlertShown() {
            return !!this.errors.length;
        },
    },
});
</script>

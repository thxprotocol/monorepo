<template>
    <b-modal :id="id" centered :title="title">
        <slot />
        <template #footer>
            <b-button class="w-100" variant="danger" @click="$emit('delete')">
                <slot name="btn-content" />
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalDelete',
    props: {
        id: String,
        title: String,
        btnContent: String,
    },
});
</script>

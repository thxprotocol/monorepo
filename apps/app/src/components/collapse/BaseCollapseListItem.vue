<template>
    <b-list-group-item>
        <div class="d-flex py-1 align-items-center cursor-pointer" @click="isCollapsed = !isCollapsed">
            {{ label }}
            <i class="fas ms-auto text-opaque" :class="isCollapsed ? 'fa-caret-up' : 'fa-caret-down'" />
        </div>
        <b-collapse v-model="isCollapsed" class="text-opaque">
            <slot />
        </b-collapse>
    </b-list-group-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCollapseListItem',
    props: {
        label: {
            type: String,
            required: true,
        },
    },
    data() {
        return { isCollapsed: false };
    },
});
</script>

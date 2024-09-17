<template>
    <b-form-group label-class="d-flex" class="mb-3">
        <template #label>
            <span v-if="label">{{ label }}</span>
            <slot v-else name="label" />
            <span v-if="required" class="text-danger ms-1">*</span>
            <b-link v-if="tooltip" v-b-tooltip class="ms-auto" :title="tooltip">
                <i class="fas fa-info-circle text-secondary" />
            </b-link>
        </template>
        <slot />
        <div class="small text-muted">
            <slot name="description">
                {{ description }}
            </slot>
        </div>
    </b-form-group>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'BaseFormGroup',
    props: {
        label: String,
        tooltip: String,
        description: String,
        required: String,
    },
});
</script>

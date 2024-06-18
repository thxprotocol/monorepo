<template>
    <b-form-group label-class="d-flex">
        <template #label>
            <span v-if="label" class="text-opaque">{{ label }}</span>
            <slot v-else name="label" />
            <span v-if="required" class="text-danger ms-1">*</span>
            <b-link v-if="tooltip" v-b-tooltip class="ms-1" :title="tooltip">
                <i class="fas fa-info-circle text-white text-opaque" />
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
        required: Boolean,
        labelClass: String,
    },
});
</script>

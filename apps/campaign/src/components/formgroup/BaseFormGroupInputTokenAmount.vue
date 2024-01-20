<template>
    <b-form-group :label="label">
        <div class="d-flex align-items-center justify-content-between">
            <b-badge
                class="p-2 d-flex align-items-center"
                variant="primary"
                style="font-size: 1rem; font-weight: normal"
            >
                <b-img v-if="image" :src="image" :alt="`${symbol} icon`" width="20" height="20" class="me-2" />
                {{ symbol }}
            </b-badge>
            <b-form-input
                :disabled="disabled"
                class="ms-3"
                :min="min"
                :max="max"
                :value="value"
                @input="$emit('update', Number($event))"
                type="number"
                style="text-align: right"
            />
        </div>
        <template #description v-if="balance">
            <div class="d-flex mb-1 justify-content-between mt-1 text-opaque">
                <div>
                    Balance: {{ balance }}
                    <span v-if="value >= balance" class="text-muted"> Maxed </span>
                </div>
            </div>
            <b-progress variant="success" class="bg-primary" :value="value" :max="balance" style="height: 5px" />
        </template>
    </b-form-group>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseFormGroupInputTokenAmount',
    props: {
        image: String,
        symbol: String,
        label: String,
        min: Number,
        max: Number,
        disabled: Boolean,
        value: { type: Number, required: true },
        balance: { type: Number },
    },
});
</script>
<style scoped>
.form-control {
    border-color: var(--bs-primary);
}
</style>

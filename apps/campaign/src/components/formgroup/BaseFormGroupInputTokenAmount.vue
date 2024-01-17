<template>
    <b-form-group :label="label">
        <div class="d-flex align-items-center justify-content-between">
            <b-badge
                class="p-2 d-flex align-items-center"
                variant="primary"
                style="font-size: 1rem; font-weight: normal"
            >
                {{ symbol }}
            </b-badge>
            <b-form-input
                class="ms-3"
                :min="min"
                :max="max"
                :value="value"
                @input="$emit('update', Number($event))"
                type="number"
                style="text-align: right"
            />
        </div>
        <template #description>
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
        symbol: String,
        label: String,
        min: Number,
        max: Number,
        value: { type: Number, required: true },
        balance: { type: Number, required: true },
    },
});
</script>

<template>
    <b-form-group :label="label">
        <div class="d-flex align-items-center justify-content-between">
            <b-badge
                class="p-2 d-flex align-items-center"
                variant="primary"
                style="font-size: 1rem; font-weight: normal"
            >
                <slot name="label"></slot>
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
            <div class="d-flex mb-1 justify-content-between mt-1 text-muted">
                <div>
                    Balance: {{ balance }}
                    <span v-if="value >= balance" class="text-muted"> (Maxed) </span>
                    <b-badge v-else @click="$emit('update', balance)" class="cursor-pointer ms-1" variant="primary">
                        Max
                    </b-badge>
                </div>
                <div>
                    {{ toFiatPrice(usd * value) }}
                </div>
            </div>
            <b-progress
                :variant="value > min ? 'success' : 'danger'"
                class="bg-primary"
                :value="value"
                :max="balance"
                style="height: 5px"
            />
        </template>
    </b-form-group>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

function toFiatPrice(number: number) {
    // Replace 'en-US' with the appropriate locale for your application
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Change this to the desired currency code
        minimumFractionDigits: 2,
    });

    return formatter.format(number);
}

export default defineComponent({
    name: 'BaseFormGroupInputTokenAmount',
    props: {
        label: String,
        min: { type: Number, required: true },
        max: Number,
        disabled: Boolean,
        usd: { type: Number, required: true },
        value: { type: Number, required: true },
        balance: { type: Number },
    },
    data() {
        return { toFiatPrice };
    },
});
</script>
<style scoped>
.form-control {
    border-color: var(--bs-primary);
}
</style>

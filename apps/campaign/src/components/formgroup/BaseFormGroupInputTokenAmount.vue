<template>
    <b-form-group :label="label">
        <div class="d-flex align-items-center justify-content-between">
            <b-badge
                class="p-2 d-flex align-items-center"
                variant="primary"
                style="font-size: 1rem; font-weight: normal"
            >
                <slot name="label" />
            </b-badge>
            <b-form-input
                :disabled="disabled"
                class="ms-3"
                :min="min"
                :max="max"
                :value="value"
                type="number"
                style="text-align: right"
                @input="$emit('update', Number($event))"
            />
        </div>
        <template v-if="balance" #description>
            <div class="d-flex mb-1 justify-content-between mt-1 text-muted">
                <div>
                    Balance: {{ balance }}
                    <span v-if="value >= balance" class="text-muted"> (Maxed) </span>
                    <b-badge v-else class="cursor-pointer ms-1" variant="primary" @click="$emit('update', balance)">
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
import { toFiatPrice } from '../../utils/price';

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

<template>
    <b-form-group :label="label">
        <div class="d-flex align-items-center justify-content-between">
            <b-badge
                v-if="$slots['label']"
                class="p-2 d-flex align-items-center me-3"
                variant="primary"
                style="font-size: 1rem; font-weight: normal"
            >
                <slot name="label" />
            </b-badge>
            <b-form-input
                v-model="valueFormatted"
                :disabled="disabled"
                :min="min"
                :max="max"
                :step="1 / 10 ** precision"
                type="number"
                style="text-align: right"
            />
        </div>
        <template #description>
            <div class="d-flex mb-1 justify-content-between mt-1 text-muted">
                <div>
                    Balance: {{ roundDownFixed(balance, precision) }}
                    <span v-if="balance > 0 && valueFormatted >= roundDownFixed(balance, precision)" class="text-muted">
                        (Maxed)
                    </span>
                    <b-badge
                        v-else-if="balance > 0"
                        class="cursor-pointer ms-1"
                        variant="primary"
                        @click="$emit('update', roundDownFixed(balance, precision))"
                    >
                        Max
                    </b-badge>
                </div>
                <div>
                    {{ toFiatPrice(usd * value) }}
                </div>
            </div>
            <b-progress
                :variant="value > min && balance >= value ? 'success' : 'danger'"
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
import { roundDownFixed, toFiatPrice } from '../../utils/price';

export default defineComponent({
    name: 'BaseFormGroupInputTokenAmount',
    props: {
        label: String,
        min: { type: Number, required: true },
        max: Number,
        disabled: Boolean,
        usd: { type: Number, required: true },
        value: { type: Number, required: true, default: 0 },
        balance: { type: Number, required: true },
        precision: { type: Number, default: 6 },
    },
    data() {
        return { toFiatPrice, roundDownFixed };
    },
    computed: {
        valueFormatted: {
            get() {
                return roundDownFixed(this.value, this.precision);
            },
            set(value: number) {
                this.$emit('update', roundDownFixed(value, this.precision));
            },
        },
    },
});
</script>
<style scoped>
.form-control {
    border-color: var(--bs-primary);
}
</style>

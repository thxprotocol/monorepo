<template>
    <BaseFormGroupInputDate
        label="Lock duration"
        tooltip="The longer you lock, the more rewards you get. You will be able to withdraw early, but a penalty will be applied."
        :enable-time-picker="false"
        :min-date="minDate"
        :max-date="maxDate"
        :allowed-dates="allowedDates"
        :start-date="minDate"
        :value="value"
        @update="$emit('update', $event)"
    >
        <template #description>
            <div class="d-flex justify-content-start">
                <b-button
                    v-for="{ timestamp, label } of suggestedDates"
                    size="sm"
                    variant="primary"
                    class="rounded-pill me-2 mt-2 mb-0"
                    :disabled="value.getTime() === timestamp"
                    @click="$emit('update', new Date(timestamp))"
                >
                    {{ label }}
                </b-button>
            </div>
        </template>
    </BaseFormGroupInputDate>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NinetyDaysInMs, getThursdaysUntilTimestamp } from '@thxnetwork/campaign/utils/date';
import { mapStores } from 'pinia';
import { useVeStore } from '@thxnetwork/campaign/stores/VE';

export default defineComponent({
    name: 'BaseFormGroupLockEnd',
    props: {
        value: { type: Date, required: true },
    },
    computed: {
        ...mapStores(useVeStore),
        allowedDates() {
            return getThursdaysUntilTimestamp(this.veStore.now, this.veStore.now + NinetyDaysInMs);
        },
        suggestedDates() {
            if (!this.allowedDates.length) return [];
            return [
                {
                    label: '2 Weeks',
                    timestamp: this.allowedDates[1],
                },
                {
                    label: '4 Weeks',
                    timestamp: this.allowedDates[3],
                },
                {
                    label: '8 Weeks',
                    timestamp: this.allowedDates[7],
                },
                {
                    label: '12 Weeks',
                    timestamp: this.allowedDates[11],
                },
            ];
        },
        minDate() {
            if (!this.allowedDates.length) return new Date();
            return new Date(this.allowedDates[0]);
        },
        maxDate() {
            return new Date(this.veStore.now + NinetyDaysInMs);
        },
    },
});
</script>

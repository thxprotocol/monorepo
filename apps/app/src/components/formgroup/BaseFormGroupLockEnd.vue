<template>
    <BaseFormGroupInputDate
        label="Lock duration"
        tooltip="The longer you lock, the more veTHX you'll get and the more rewards you can claim. You will be able to withdraw early, but a penalty will be applied."
        :enable-time-picker="false"
        :min-date="minDate"
        :max-date="maxDate"
        :allowed-dates="allowedDates"
        :start-date="minDate"
        :value="value"
        @update="$emit('update', $event)"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '@thxnetwork/app/stores/VE';
import { BigNumber } from 'alchemy-sdk';
import { getThursdaysUntilTimestamp, NinetyDaysInMs, OneWeekInMs } from '@thxnetwork/app/utils/date';

export default defineComponent({
    name: 'BaseFormGroupLockEnd',
    props: {
        value: { type: Date, required: true },
    },
    computed: {
        ...mapStores(useVeStore),
        startDate() {
            // If there is a lock the start date should be lock end instead of now
            if (!BigNumber.from(this.veStore.lock.amount).eq(0)) {
                return new Date(this.veStore.lock.end).getTime();
            }
            return this.veStore.now;
        },
        allowedDates() {
            return getThursdaysUntilTimestamp(this.startDate, this.startDate + NinetyDaysInMs);
        },
        minDate() {
            // If there is a lock the min date should be the current lock end date + 1 week
            if (!BigNumber.from(this.veStore.lock.amount).eq(0)) {
                return new Date(this.veStore.lock.end + OneWeekInMs);
            }

            // If not we pick the first suggested allowed date
            if (!this.allowedDates.length) return new Date();
            return new Date(this.allowedDates[0]);
        },
        maxDate() {
            return new Date(this.veStore.now + NinetyDaysInMs);
        },
    },
});
</script>

<template>
    <b-card class="border-0 gradient-shadow-xl" style="min-height: 415px">
        <b-tabs v-model="index" pills justified content-class="mt-3" nav-wrapper-class="text-white">
            <b-tab>
                <template #title>
                    <i class="fas fa-balance-scale me-1" />
                    Liquidity
                </template>
                <hr />
                <BaseTabLiquidity @change-tab="index = $event" />
            </b-tab>
            <b-tab>
                <template #title>
                    <i class="fas fa-id-card me-1" />
                    Membership
                </template>
                <hr />
                <BaseTabDeposit v-if="veStore.lock && !Number(veStore.lock.amount)" @change-tab="index = $event" />
                <BaseTabWithdraw v-else @change-tab="index = $event" />
            </b-tab>
        </b-tabs>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';

export default defineComponent({
    name: 'BaseCardMembership',
    props: {
        tabIndex: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            index: 0,
        };
    },
    computed: {
        ...mapStores(useVeStore),
    },
    watch: {
        tabIndex: {
            handler(value: number) {
                this.index = value;
            },
            immediate: true,
        },
    },
    methods: {},
});
</script>

<template>
    <BaseCardHeader>
        <template #primary>
            <div>
                <h1 class="text-opaque">Lock & Earn</h1>
                <p class="lead mb-4">
                    Members earn additional <strong>20USDC-80THX</strong>
                    <sup class="text-success ms-1">
                        {{ toFiatPrice(Number(roundUpFixed(liquidityStore.pricing['20USDC-80THX'], 2))) }}
                    </sup>
                    next to the native <strong>BAL</strong>
                    <sup class="text-success ms-1">
                        {{ toFiatPrice(Number(roundUpFixed(liquidityStore.pricing['BAL'], 2))) }}
                    </sup>
                    for providing liquidity!
                </p>
                <div class="d-flex">
                    <BaseDropdownMetricAPR />
                    <BaseDropdownMetricTVL />
                </div>
                <hr />
                <BaseDropdownMetricRewards />
            </div>
        </template>
        <template #secondary>
            <b-card class="border-0 gradient-shadow-xl" style="min-height: 415px">
                <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
                    <b-tab>
                        <template #title>
                            <i class="fas fa-balance-scale me-1" />
                            Liquidity
                        </template>
                        <hr />
                        <BaseTabLiquidity @change-tab="tabIndex = $event" />
                    </b-tab>
                    <b-tab>
                        <template #title>
                            <i class="fas fa-id-card me-1" />
                            Membership
                        </template>
                        <hr />
                        <BaseTabDeposit
                            v-if="veStore.lock && !Number(veStore.lock.amount)"
                            @change-tab="tabIndex = $event"
                        />
                        <BaseTabWithdraw v-else @change-tab="tabIndex = $event" />
                    </b-tab>
                </b-tabs>
            </b-card>
        </template>
    </BaseCardHeader>
    <b-container>
        <h2 class="mt-5">Reward Distribution</h2>
        <b-row>
            <b-col v-for="{ week, total } of schedule" lg="3">
                <div class="bg-primary p-4 rounded my-2">
                    <span class="text-opaque">Week {{ week }}</span>
                    <div class="h3 mb-0">{{ toFiatPrice(total) }}</div>
                </div>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { roundUpFixed, toFiatPrice } from '@thxnetwork/campaign/utils/price';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { startOfWeek, addWeeks, format, eachWeekOfInterval } from 'date-fns';

export default defineComponent({
    name: 'Earn',
    data() {
        return {
            toFiatPrice,
            roundUpFixed,
            formatUnits,
            tabIndex: 1,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
        schedule() {
            const { bal, bpt } = this.liquidityStore.schedule;
            const balPriceInWei = parseUnits(this.liquidityStore.pricing['BAL'].toString(), 18);
            const bptPriceInWei = parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);

            // Usage
            const weekNumbers = this.getWeekNumbers();
            return weekNumbers.map((week, index) => {
                const valueBAL = BigNumber.from(bal[index]).mul(balPriceInWei);
                const valueBPT = BigNumber.from(bpt[index]).mul(bptPriceInWei);
                const total = valueBAL.add(valueBPT);

                return {
                    week,
                    balInWei: bal[index],
                    bptInWei: bpt[index],
                    balInUSD: formatUnits(valueBAL, 18),
                    bptInUSD: formatUnits(valueBPT, 18),
                    total: formatUnits(total, 18 * 2), // 18 * 2 as we need to format both price and amount in wei
                };
            });
        },
    },
    methods: {
        getWeekNumbers() {
            const today = new Date();
            const currentWeek = format(startOfWeek(today, { weekStartsOn: 3 }), 'w'); // Setting Thursday as the start of the week
            const nextFourWeeks = eachWeekOfInterval({
                start: addWeeks(today, 1),
                end: addWeeks(today, 3),
            });
            const weekNumbers = [currentWeek, ...nextFourWeeks.map((date) => format(date, 'w'))];
            return weekNumbers;
        },
    },
});
</script>
<style>
.form-control,
.form-control:focus {
    border-color: var(--bs-primary);
}
.progress {
    background-color: var(--bs-primary);
}
</style>
<style>
.nav-pills .nav-link:not(.active) {
    color: white;
    opacity: 0.75;
}
.placeholder {
    border-radius: 3px !important;
}
</style>

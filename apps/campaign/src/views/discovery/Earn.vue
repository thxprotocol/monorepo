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
                <b-button
                    variant="link"
                    class="text-white text-decoration-none rounded py-0 ms-5"
                    @click="onClickRewards"
                >
                    <div class="d-block-inline rounded fw-normal text-start" variant="primary">
                        <div class="small text-opaque">Your Rewards</div>
                        <div class="lead fw-bold text-accent">
                            <span>{{ toFiatPrice(rewardsInUSD) }}</span>
                        </div>
                    </div>
                </b-button>
                <BaseModalClaimTokens
                    :show="veStore.isModalClaimTokensShown"
                    @hidden="veStore.isModalClaimTokensShown = false"
                />
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
    <b-container class="mb-5">
        <h2 class="mt-5">Reward Distribution</h2>
        <b-row>
            <b-col v-for="reward of schedule" lg="3">
                <div class="bg-primary p-4 rounded my-2 gradient-bg">
                    <BaseDropdownMetricReward :reward="reward" />
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
                    balInUSD: formatUnits(valueBAL, 18 * 2),
                    bptInUSD: formatUnits(valueBPT, 18 * 2),
                    total: formatUnits(total, 18 * 2), // 18 * 2 as we need to format both price and amount in wei
                };
            });
        },
        rewardsInUSD() {
            if (!this.veStore.rewards.length) return 0;

            const balRewards = Number(formatUnits(this.veStore.rewards[0].amount, 'ether'));
            const bptRewards = Number(formatUnits(this.veStore.rewards[1].amount, 'ether'));
            const balPrice = this.liquidityStore.pricing['BAL'];
            const bptPrice = this.liquidityStore.pricing['20USDC-80THX'];

            return balRewards * balPrice + bptRewards * bptPrice;
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
            return [currentWeek, ...nextFourWeeks.map((date) => format(date, 'w'))];
        },
        onClickRewards() {
            this.veStore.isModalClaimTokensShown = true;
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

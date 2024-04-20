<template>
    <BaseCardHeader>
        <template #primary>
            <div>
                <h1 class="text-opaque">Lock & Earn</h1>
                <p class="lead mb-4">
                    Members earn additional
                    <b-link
                        class="fw-bold text-white text-decoration-none"
                        target="_blank"
                        href="https://www.coingecko.com/en/coins/thx-network"
                    >
                        $THX
                    </b-link>
                    <sup class="text-success ms-1">
                        {{ toFiatPrice(Number(roundUpFixed(liquidityStore.pricing['THX'], 2))) }}
                    </sup>
                    and
                    <b-link
                        class="fw-bold text-white text-decoration-none"
                        target="_blank"
                        href="https://www.coingecko.com/en/coins/usdc"
                    >
                        $USDC
                    </b-link>
                    <sup class="text-success ms-1">
                        {{ toFiatPrice(Number(roundUpFixed(liquidityStore.pricing['USDC'], 2))) }}
                    </sup>
                    next to your native
                    <b-link
                        class="fw-bold text-white text-decoration-none"
                        target="_blank"
                        href="https://www.coingecko.com/en/coins/balancer"
                    >
                        $BAL
                    </b-link>
                    <sup class="text-success ms-1">
                        {{ toFiatPrice(Number(roundUpFixed(liquidityStore.pricing['BAL'], 2))) }}
                    </sup>
                    rewards for providing liquidity!
                </p>
                <div class="d-flex">
                    <BaseDropdownMetric label="APR" :value="aprMetric" :metrics="[]" class="me-4" />
                    <BaseDropdownMetric label="TVL" :value="toFiatPrice(tvlMetric)" :metrics="[]" />
                </div>
                <hr />
                <BaseDropdownMetric
                    label="Rewards"
                    :value="toFiatPrice(rewardsMetric.totalInUSD)"
                    :metrics="[
                        {
                            label: '$BAL',
                            url: chainInfo.blockExplorer + '/token/' + address.BAL,
                            badge: toFiatPrice(liquidityStore.pricing['BAL']),
                            data: [
                                { label: 'Amount', value: rewardsMetric.bal },
                                { label: 'Value', value: toFiatPrice(rewardsMetric.balInUSD) },
                            ],
                        },
                        {
                            label: '$20USDC-80THX',
                            url: 'https://app.balancer.fi/#/polygon/pool/0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe',
                            badge: toFiatPrice(liquidityStore.pricing['20USDC-80THX']),
                            data: [
                                { label: 'Amount', value: rewardsMetric.bpt },
                                { label: 'Value', value: toFiatPrice(rewardsMetric.bptInUSD) },
                            ],
                        },
                    ]"
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
    <b-container>
        <h2 class="mt-5">Reward Distribution</h2>
        <b-row>
            <b-col v-for="{ week, total } of schedule" lg="3">
                <div class="bg-primary p-4 rounded">
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
import { BALANCER_POOL_ID, contractNetworks } from '@thxnetwork/campaign/config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { chainList } from '@thxnetwork/campaign/utils/chains';

export default defineComponent({
    name: 'Earn',
    data() {
        return {
            toFiatPrice,
            roundUpFixed,
            formatUnits,
            tabIndex: 1,
            balancerPoolId: BALANCER_POOL_ID,
            isAlertSigninShown: true,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
        chainInfo() {
            if (!this.walletStore.wallet) return chainList[ChainId.Polygon];
            return chainList[this.walletStore.wallet.chainId];
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        aprMetric() {
            const { balancer } = this.liquidityStore.apr;
            return balancer.min.toFixed(2) + '% - ' + balancer.max.toFixed(2) + '%';
        },
        tvlMetric() {
            const tvlInWei = formatUnits(this.liquidityStore.tvl, 18).toString();
            const bptPrice = this.liquidityStore.pricing['20USDC-80THX'];
            return {
                tvlInWei: tvlInWei,
                totalInUSD: Number(tvlInWei) * bptPrice,
            };
        },
        rewardsMetric() {
            const { bal, bpt } = this.liquidityStore.rewards;
            const balPriceInWei = parseUnits(this.liquidityStore.pricing['BAL'].toString(), 18);
            const bptPriceInWei = parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);
            const valueBAL = BigNumber.from(bal).mul(balPriceInWei);
            const valueBPT = BigNumber.from(bpt).mul(bptPriceInWei);
            const totalInWei = valueBAL.add(valueBPT);

            return {
                bal: Number(formatUnits(bal, 18)).toFixed(6),
                bpt: Number(formatUnits(bpt, 18)).toFixed(6),
                balInUSD: formatUnits(valueBAL, 18 * 2),
                bptInUSD: formatUnits(valueBPT, 18 * 2),
                totalInUSD: formatUnits(totalInWei, 18 * 2),
            };
        },
        rewards() {
            const balPriceInWei = parseUnits(this.liquidityStore.pricing['BAL'].toString(), 18);
            const bptPriceInWei = parseUnits(this.liquidityStore.pricing['20USDC-80THX'].toString(), 18);

            const valueBALInWei = BigNumber.from(this.liquidityStore.rewards.bal).mul(balPriceInWei);
            const valueBPTInWei = BigNumber.from(this.liquidityStore.rewards.bpt).mul(bptPriceInWei);

            return {
                bal: '',
                bpt: '',
                total: valueBALInWei.add(valueBPTInWei),
            };
        },
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
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                this.veStore.getLocks(wallet);
                this.liquidityStore.listMetrics(wallet);
            },
            immediate: true,
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

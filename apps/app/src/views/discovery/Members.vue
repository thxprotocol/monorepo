<template>
    <BaseCardHeader>
        <template #primary>
            <h1 class="">
                Members <br />
                <strong>earn more!</strong>
            </h1>
            <p class="lead text-opaque">
                Gain additional benefits for locking <strong>$THX/USDC.e</strong> liquidity at Balancer.fi
                <b-link
                    href="https://app.balancer.fi/#/polygon/pool/0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe"
                    class="text-white"
                    target="_blank"
                >
                    <i class="fas fa-external-link-alt" style="font-size: 0.8rem" />
                </b-link>
            </p>
            <b-badge
                v-for="benefit of benefits"
                v-b-tooltip
                variant="dark"
                class="p-2 me-2 mb-2"
                style="font-size: 0.8rem"
                :title="benefit.title"
            >
                <i :class="benefit.icon" class="text-opaque me-2" />
                <span class="fw-bold">{{ benefit.label }}</span>
            </b-badge>
        </template>
        <template #secondary>
            <BaseCardMembership :tab-index="2" />
        </template>
    </BaseCardHeader>
    <b-container class="mb-5">
        <b-container class="mb-5">
            <b-row>
                <b-col md="8">
                    <h2 class="mt-5">Reward Distribution</h2>
                    <p class="lead">
                        Members can claim their share of the BAL emissions received by the veTHX contracts and share
                        protocol fees.
                    </p>
                    <b-row>
                        <b-col v-for="reward of schedule" lg="3">
                            <div class="bg-primary p-4 rounded my-2 gradient-bg">
                                <BaseDropdownMetricReward :reward="reward" />
                            </div>
                        </b-col>
                    </b-row>
                    <hr />
                    <div class="my-5">
                        <h2 class="mt-5">Partner Lottery</h2>
                        <p class="lead">
                            Members can buy lottery tickets with up to a 90% discount for NFT rewards from web3 game
                            partners!
                        </p>
                    </div>
                    <BaseCardLottery v-for="l of lotteries" :lottery="l" />
                </b-col>
                <b-col md="4">
                    <b-card class="mt-5" header-class="py-3">
                        <template #header>
                            <i class="fas fa-gift text-opaque me-2" />
                            Your Rewards
                        </template>
                        <div class="d-flex">
                            <BaseDropdownMetricRewards />
                            <BaseDropdownMetricAPR />
                            <BaseDropdownMetricTVL />
                        </div>
                        <b-button
                            variant="primary"
                            :disabled="!rewardsInUSD"
                            class="w-100 mt-3"
                            @click="onClickRewards"
                        >
                            <template v-if="rewardsInUSD">
                                Claim <strong>{{ toFiatPrice(rewardsInUSD) }}</strong>
                            </template>
                            <template v-else>No rewards yet!</template>
                        </b-button>
                        <BaseModalClaimTokens
                            :show="veStore.isModalClaimTokensShown"
                            @hidden="veStore.isModalClaimTokensShown = false"
                        />
                    </b-card>
                    <b-card class="mt-3" header-class="py-3">
                        <template #header>
                            <i class="fas fa-search text-opaque me-2" />
                            Suggest partners!
                        </template>
                        <p class="text-opaque">
                            Let us know which project to feature in our bi-weekly Partner Lottery!
                        </p>
                        <p class="text-opaque">
                            The projects needs to offer rare and valuable assets that we can purchase with our $500USD
                            budget on the open market.
                        </p>
                        <b-button
                            variant="primary"
                            href="https://forms.gle/KFqdT1YswNR28cHf9"
                            target="_blank"
                            class="w-100"
                        >
                            Suggest Partner
                            <i class="fas fa-external-link-alt ms-2" />
                        </b-button>
                    </b-card>
                    <b-card class="mt-3" header-class="py-3" no-body>
                        <template #header>
                            <i class="fas fa-info-circle text-opaque me-2" />
                            Frequently Asked Questions
                        </template>
                        <b-list-group style="border-radius: 0">
                            <BaseCollapseListItem label="How can I participate?">
                                Participation is easy! Complete the
                                <b-link class="text-white" to="/learn"> onboarding quests</b-link> and purchase your
                                lottery tickets. Higher membership tiers get larger discounts.
                            </BaseCollapseListItem>
                            <BaseCollapseListItem label="How are projects picked?">
                                Our dedicated lottery team selects projects to feature in our weekly lottery. Contact
                                the core team in Discord if you want to submit a candidate!
                            </BaseCollapseListItem>
                            <BaseCollapseListItem label="What software is used?">
                                The lottery is powered by the THX Network tool suite.
                                <a :href="dashboardURL" class="text-white" target="_blank">
                                    Sign in to your dashboard</a
                                >
                                to create your own campaigns.
                            </BaseCollapseListItem>
                        </b-list-group>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </b-container>
    <b-container class="mb-5">
        <b-row>
            <b-col md="8"> </b-col>
            <b-col md="4"> </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import axios from 'axios';
import { API_URL, DASHBOARD_URL } from '@thxnetwork/app/config/secrets';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { useVeStore } from '@thxnetwork/app/stores/VE';
import { roundUpFixed, toFiatPrice } from '@thxnetwork/app/utils/price';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { BigNumber } from 'alchemy-sdk';
import { startOfWeek, addWeeks, format, eachWeekOfInterval } from 'date-fns';

export default defineComponent({
    name: 'Members',
    data() {
        return {
            formatUnits,
            isAlertShown: true,
            dashboardURL: DASHBOARD_URL,
            lotteries: [],
            toFiatPrice,
            roundUpFixed,
            tabIndex: 1,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
        benefits() {
            return [
                {
                    title: 'Members can buy discounted lottery tickets',
                    icon: 'fas fa-tags',
                    label: 'Lottery Discounts',
                },
                {
                    title: 'Members share in 70% of the protocol revenue',
                    icon: 'fas fa-coins',
                    label: ' Protocol Fees',
                },
                {
                    title: `Members can earn up to ${Number(this.liquidityStore.apr.balancer.apr).toFixed(
                        2,
                    )}% APR on locked liquidity`,
                    icon: 'fas fa-balance-scale',
                    label: 'Balancer APR',
                },
                {
                    title: 'Members can a claim their free THX Network Discord Role',
                    icon: 'fas fa-trophy',
                    label: 'Discord Role',
                },
            ];
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
    async mounted() {
        const { data } = await axios(API_URL + '/v1/lotteries');
        this.lotteries = data;
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

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
                <span class="text-success fw-bold">{{ benefit.label }}</span>
            </b-badge>
        </template>
        <template #secondary>
            <BaseCardMembership :tab-index="2" />
        </template>
    </BaseCardHeader>

    <b-container class="mb-5">
        <b-row>
            <b-col md="8">
                <div class="my-5">
                    <h2 class="mt-5">NFT Lottery</h2>
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
                        <i class="fas fa-search text-opaque me-2" />
                        Suggest the next lottery project!
                    </template>
                    <p class="text-opaque">
                        We're always looking for new projects with rate and valuable assets that we can purchase on the
                        open market to feature in the bi-weekly THX Network lottery.
                    </p>
                    <b-button
                        variant="success"
                        href="https://forms.gle/KFqdT1YswNR28cHf9"
                        target="_blank"
                        class="w-100"
                    >
                        <strong>Suggest Project</strong>
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
                            <b-link class="text-white" to="/learn"> onboarding quests</b-link> and purchase your lottery
                            tickets. Higher membership tiers get larger discounts.
                        </BaseCollapseListItem>
                        <BaseCollapseListItem label="How are projects picked?">
                            Our dedicated lottery team selects projects to feature in our weekly lottery. Contact the
                            core team in Discord if you want to submit a candidate!
                        </BaseCollapseListItem>
                        <BaseCollapseListItem label="What software is used?">
                            The lottery is powered by the THX Network tool suite.
                            <a :href="dashboardURL" class="text-white" target="_blank"> Sign in to your dashboard</a> to
                            create your own campaigns.
                        </BaseCollapseListItem>
                    </b-list-group>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { API_URL, DASHBOARD_URL } from '@thxnetwork/app/config/secrets';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { useVeStore } from '@thxnetwork/app/stores/VE';
import axios from 'axios';
import { formatUnits } from 'ethers/lib/utils';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

const Rewards = {
    ForestKnight: {
        RunestoneOfTheEclipse: {
            title: 'Runestone of the Eclipse',
            description:
                'Rate items from the Mines of Eragoth collection can be bought at a discount using your THX campaign points.',
            marketValue: '199 MATIC',
            image: 'https://i.seadn.io/s/raw/files/77485858457f42c1e4a3f5d89436cced.png?auto=format&dpr=1&w=1000',
        },
        BigBagOfKnight: {
            title: 'Big bag of $KNIGHT',
            description:
                'We distribute 375 USD worth of $KNIGHT as coin rewards ready to be redeemed for your THX campaign points.',
            marketValue: '375 USD',
            image: 'https://miro.medium.com/v2/resize:fit:1000/format:webp/1*-TH_NNMfBLgtbZhvZmNoCA.png',
        },
        ClockworkCodex: {
            title: 'Clockwork Codex',
            description:
                'A bunch of these will be made available for redemption at a discount using your THX campaign points.',
            marketValue: '30 MATIC',
            image: 'https://i.seadn.io/s/raw/files/71fdb00461b8d0d6d0db8e2c714eee8e.png?auto=format&dpr=1&w=1000',
        },
    },
};

export default defineComponent({
    name: 'Members',
    data() {
        return {
            formatUnits,
            isAlertShown: true,
            dashboardURL: DASHBOARD_URL,
            lotteries: [],
        };
    },
    async mounted() {
        const { data } = await axios(API_URL + '/v1/lotteries');
        this.lotteries = data;
    },
    computed: {
        ...mapStores(useLiquidityStore, useVeStore),
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
    },
});
</script>

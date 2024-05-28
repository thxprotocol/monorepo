<template>
    <BaseCardHeader>
        <template #primary>
            <h1 class="text-opaque">
                Members <br />
                earn more!
            </h1>
            <p class="lead">
                Gain additional benefits for providing liquidity using your <strong>$THX</strong> or
                <strong>$USDC.e</strong>.
            </p>
        </template>
        <template #secondary>
            <BaseCardMembership :tab-index="1" />
        </template>
    </BaseCardHeader>
    <b-container class="mt-5">
        <b-row>
            <b-col lg="3">
                <b-card class="gradient-bg mb-3" body-class="text-center py-4">
                    <i class="fas fa-trophy h2 text-opaque" />
                    <div>Discord Role</div>
                    <p class="mb-1 text-opaque">Members can a claim their free THX Network Discord Role</p>
                </b-card>
            </b-col>
            <b-col lg="3">
                <b-card class="gradient-bg mb-3" body-class="text-center py-4">
                    <i class="fas fa-balance-scale h2 text-opaque" />
                    <div>Balancer APR</div>
                    <p class="mb-1 text-opaque">
                        Members automagically earn up to {{ Number(liquidityStore.apr.balancer.max).toFixed(2) }}% APR
                    </p>
                </b-card>
            </b-col>
            <b-col lg="3">
                <b-card class="gradient-bg mb-3" body-class="text-center py-4">
                    <i class="fas fa-coins h2 text-opaque" />
                    <div>Protocol Revenue Share</div>
                    <p class="mb-1 text-opaque">Members share in 70% of the protocol revenue</p>
                </b-card>
            </b-col>
            <b-col lg="3">
                <b-card class="gradient-bg mb-3" body-class="text-center py-4">
                    <i class="fas fa-gift h2 text-opaque" />
                    <div>Exclusive Rewards</div>
                    <p class="mb-1 text-opaque">Members can buy discounted rewards from partners</p>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
    <b-container class="mb-5">
        <div class="text-center">
            <h2 class="mt-5">Members Only</h2>
            <p class="lead">Members can use their points to buy rewards from partners at a discount!</p>
        </div>
        <b-row>
            <b-col v-for="reward of rewards" lg="4">
                <BaseCardReward :reward="reward" :image="reward.image">
                    <template #title>
                        <div class="flex-grow-1">{{ reward.title }}</div>
                        <div v-if="reward.amount" class="text-success fw-bold">{{ reward.amount }}x</div>
                    </template>
                </BaseCardReward>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { useVeStore } from '@thxnetwork/app/stores/VE';
import { formatUnits } from 'ethers/lib/utils';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Members',
    data() {
        return {
            formatUnits,
            isAlertShown: true,
            rewards: [
                {
                    title: 'Runestone of the Eclipse',
                    description:
                        'Rate items from the Mines of Eragoth collection can be bought at a discount using your THX campaign points.',
                    pointPrice: '199 MATIC',
                    isLocked: false,
                    isStocked: true,
                    isExpired: false,
                    isDisabled: true,
                    variant: 1,
                    amount: 1,
                    image: 'https://i.seadn.io/s/raw/files/77485858457f42c1e4a3f5d89436cced.png?auto=format&dpr=1&w=1000',
                    limitProgress: {
                        max: 0,
                        count: 0,
                    },
                    limitSupplyProgress: {
                        max: 0,
                        count: 0,
                    },
                },
                {
                    title: 'Big bag of $KNIGHT',
                    description:
                        'We distribute 375 USD worth of $KNIGHT as coin rewards ready to be redeemed for your THX campaign points.',
                    pointPrice: '375 USD',
                    isLocked: false,
                    isStocked: true,
                    isExpired: false,
                    isDisabled: true,
                    variant: 0,
                    image: 'https://miro.medium.com/v2/resize:fit:1000/format:webp/1*-TH_NNMfBLgtbZhvZmNoCA.png',
                    limitProgress: {
                        max: 0,
                        count: 0,
                    },
                    limitSupplyProgress: {
                        max: 0,
                        count: 0,
                    },
                },
                {
                    title: 'Clockwork Codex',
                    description:
                        'A bunch of these will be made available for redemption at a discount using your THX campaign points.',
                    pointPrice: '30 MATIC',
                    isLocked: false,
                    isStocked: true,
                    isExpired: false,
                    isDisabled: true,
                    variant: 1,
                    amount: 4,
                    image: 'https://i.seadn.io/s/raw/files/71fdb00461b8d0d6d0db8e2c714eee8e.png?auto=format&dpr=1&w=1000',
                    limitProgress: {
                        max: 0,
                        count: 0,
                    },
                    limitSupplyProgress: {
                        max: 0,
                        count: 0,
                    },
                },
            ] as any[],
        };
    },
    computed: {
        ...mapStores(useLiquidityStore, useVeStore),
    },
});
</script>

<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1 pt-0 pb-5">
        <b-row class="py-md-5">
            <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex">
                <div>
                    <h1>Earn THX</h1>
                    <p class="lead mb-4">Earn additional rewards by investing in Balancer liquidity pools.</p>
                    <b-button @click="onClickStart" variant="primary" class="me-3 px-5">
                        Claim
                        <i class="fas fa-chevron-right ms-2" />
                    </b-button>
                    <b-button :href="publicUrl" target="_blank" variant="link" class="text-white">
                        Learn more
                    </b-button>
                </div>
            </b-col>
            <b-col lg="5" class="py-4 py-lg-0 offset-lg-3 text-right">
                <b-card class="p-1">
                    <BTable
                        class="mb-0"
                        responsive="lg"
                        show-empty
                        :items="[
                            { Token: 'THX Network (POS)', MyBalance: '1000 THX', Action: 'Invest' },
                            { Token: 'THX Network (VE)', MyBalance: '2000 veTHX', Action: 'Stake' },
                        ]"
                    >
                        <template #head(Action)="{ item }"></template>
                        <template #cell(Action)="{ item }">
                            <b-button size="sm" class="w-100" variant="primary">{{ item['Action'] }}</b-button>
                        </template>
                    </BTable>
                </b-card>
            </b-col>
        </b-row>
        <h2>Investments</h2>
        <BTable responsive="lg" show-empty :items="investments">
            <template #cell(tokens)="{ item }">
                <template v-for="token of item.tokens">
                    <b-img width="23" class="rounded-circle" :src="imgTokens[token.address]" />
                </template>
                <b-badge
                    class="p-2"
                    :class="!key && 'ms-2 text-dark'"
                    :variant="!key ? 'white' : 'link'"
                    v-for="(token, key) of item.tokens"
                >
                    {{ token.symbol }} <small>{{ Number(token.weight) * 100 }}%</small>
                </b-badge>
            </template>
            <template #cell(apr)="{ item }">
                <span class="text-success">{{ item.apr }}</span> ✨
            </template>
            <template #head(pool)="{ item }"></template>
            <template #cell(pool)="{ item }">
                <b-button
                    variant="primary"
                    size="sm"
                    :href="`https://app.balancer.fi/#/polygon/pool/${item.pool.id}`"
                    target="_blank"
                >
                    View Pool
                </b-button>
            </template>
        </BTable>
        <h2 class="mt-5">Rewards</h2>
        <BTable
            responsive="lg"
            show-empty
            :items="[
                {
                    Token: {
                        image: 'https://raw.githubusercontent.com/balancer-labs/assets/refactor-for-multichain/assets/0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015.png',
                        name: 'THX Network (POS)',
                    },
                    Amount: '768.231 THX',
                    Value: '$32.22',
                    Action: 'Claim',
                },
                {
                    Token: {
                        image: 'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png',
                        name: 'Balancer (POS)',
                    },
                    Amount: '35.203 BAL',
                    Value: '$12.22',
                    Action: 'Claim',
                },
            ]"
        >
            <template #cell(Token)="{ item }">
                <b-img width="23" class="rounded-circle me-2" :src="item.Token.image" />
                {{ item.Token.name }}
            </template>
            <template #head(Action)="{ item }"></template>
            <template #cell(Action)="{ item }">
                <b-button variant="primary" size="sm">{{ item.Action }}</b-button>
            </template>
        </BTable>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { Pool, BalancerSDK, BalancerSdkConfig, Network } from '@balancer-labs/sdk';
import imgLogo from '../../assets/logo.png';

const BALANCER_POOL_ID = '0xeab6455f8a99390b941a33bbdaf615abdf93455e000200000000000000000a66';
const TEST_LP = ''.toLowerCase();
const config: BalancerSdkConfig = {
    network: Network.POLYGON,
    rpcUrl: `https://polygon-mainnet.infura.io/v3/19873fb8698b40fe816387d20a5d61f4`,
    enableLogging: true,
};
const balancer = new BalancerSDK(config);

export default defineComponent({
    name: 'Earn',
    components: {},
    data(): any {
        return {
            imgLogo,
            pool: null,
            apr: null,
            imgTokens: {
                // THX
                '0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015':
                    'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015.png',
                // stMATIC
                '0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4':
                    'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4.png',
                // BAL
                '0xba100000625a3754423978a60c9317c58a424e3d':
                    'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png',
            },
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        investments() {
            if (!this.pool) return [];
            return [
                {
                    tokens: this.pool.tokens,
                    name: this.pool.name,
                    apr: `${this.apr.min / 100}%-${this.apr.max / 100}%`,
                    myValue: '',
                    poolValue: `$${Math.floor(this.pool.totalLiquidity)}`,
                    pool: this.pool,
                },
            ];
            // [
            //     {
            //         Composition: 'Balancer THX/USD',
            //         APR: '16.27%-37.94%',
            //         MyValue: '$930,12',
            //         PoolValue: '$2830,12',
            //         More: 'https://app.balancer.fi/#/polygon/pool/0xeab6455f8a99390b941a33bbdaf615abdf93455e000200000000000000000a66',
            //     },
            // ]
        },
    },
    async mounted() {
        const pool = await balancer.pools.find(BALANCER_POOL_ID);
        if (!pool) return;

        this.apr = await balancer.pools.apr(pool as Pool);
        this.pool = pool;

        // THX Balance
        // veBAL Balance
        // BAL Balance

        // Unstaked
        const poolShares = await balancer.data.poolShares.findByUser(TEST_LP);
        const poolShare = poolShares?.find((share) => share.poolId === pool.id);
        console.log({ poolShare });

        // Staked
        const gaugeShares = await balancer.data.gaugeShares?.findByUser(TEST_LP);
        const gaugeShare = gaugeShares?.find((share) => share.gauge.poolId === pool.id);
        console.log({ gaugeShare });

        const balanceGauges = await balancer.claimService?.getClaimableRewardTokens(TEST_LP);
        console.table({ balanceGauges });

        // const claimableTokens: string[] = ['0xba100000625a3754423978a60c9317c58a424e3D'];
        // const balanceGaugesVeBal = await balancer.claimService?.getClaimableVeBalTokens(TEST_LP, claimableTokens);
        // console.table({ balanceGaugesVeBal });
    },
    methods: {},
});
</script>

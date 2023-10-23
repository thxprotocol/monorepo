<template>
    <b-container class="flex-grow-1 overflow-auto order-lg-1 pt-0 pb-5">
        <b-row class="py-md-5">
            <b-col lg="4" class="pb-0 pt-4 pt-lg-0 text-white brand-intro align-items-center d-flex">
                <div>
                    <h1>Earn THX</h1>
                    <p class="lead mb-4">
                        Earn additional rewards by investing your earned tokens in Balancer liquidity pools.
                    </p>
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
                            { Token: 'Voted Escrow BAL', MyBalance: '2000 veBAL', Action: 'Stake' },
                        ]"
                    >
                        <template #head(Action)="{ item }"></template>
                        <template #cell(Action)="{ item }">
                            <b-button @click="joinPool" size="sm" class="w-100" variant="primary">{{
                                item['Action']
                            }}</b-button>
                        </template>
                    </BTable>
                </b-card>
            </b-col>
        </b-row>
        <h2>Investments</h2>
        <BTable responsive="lg" :items="investments" :show-empty="true">
            <template #empty> <b-spinner small /> </template>
            <template #cell(tokens)="{ item }">
                <template v-for="token of item.tokens">
                    <b-img width="23" class="rounded-circle" :src="`${imgTokensUrl}${token.address}.png`" />
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
            <template #head(apr)="">
                <span>APR</span>
                <i
                    v-b-tooltip
                    title="Annual Percentage Rate; yearly rate earned over your investment."
                    class="fas fa-question-circle ms-2"
            /></template>
            <template #cell(apr)="{ item }">
                <span class="text-success">{{ item.apr }}</span> ✨
            </template>
            <template #head(pool)=""></template>
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
import { useWalletStore } from '../../stores/Wallet';

const BALANCER_POOL_ID = '0xeab6455f8a99390b941a33bbdaf615abdf93455e000200000000000000000a66';
const config: BalancerSdkConfig = {
    network: Network.POLYGON,
    rpcUrl: `https://polygon-mainnet.infura.io/v3/86d56ef25fa3495fb9e2f70f0d5ddc49`,
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
            imgTokensUrl: 'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/',
            poolShare: 0,
            poolBalanceUSD: 0,
            gaugeShare: 0,
            gaugeBalanceUSD: 0,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
        investments() {
            if (!this.pool) return [];
            return [
                {
                    tokens: this.pool.tokens,
                    apr: `${this.apr.min / 100}%-${this.apr.max / 100}%`,
                    myValue: `$${Math.floor(this.poolBalanceUSD + this.gaugeBalanceUSD)}`,
                    poolValue: `$${Math.floor(this.pool.totalLiquidity)}`,
                    pool: this.pool,
                },
            ];
        },
    },
    watch: {
        'walletStore.wallet'(wallet: TWallet) {
            this.getPoolShare(wallet.address);
            this.getGaugeShare(wallet.address);
        },
    },
    async mounted() {
        const pool = await balancer.pools.find(BALANCER_POOL_ID);
        if (!pool) return;

        const [apr, price] = await Promise.all([
            await balancer.pools.apr(pool as Pool),
            await balancer.pools.liquidityService.getBptPrice(pool),
        ]);
        this.apr = apr;
        this.price = price;
        this.pool = pool;
    },
    methods: {
        // Unstaked
        async getPoolShare(walletAddress: string) {
            const poolShares = await balancer.data.poolShares.findByUser(walletAddress);
            this.poolShare = poolShares?.find((share) => share.poolId === this.pool.id);
            this.poolBalanceUSD = this.poolShare ? Number(this.poolShare.balance) * Number(this.price) : 0;
            console.log(this.poolShare);
        },
        // Staked
        async getGaugeShare(walletAddress: string) {
            const gaugeShares = await balancer.data.gaugeShares?.findByUser(walletAddress);
            this.gaugeShare = gaugeShares?.find((share) => share.gauge.poolId === this.pool.id);
            this.gaugeBalanceUSD = this.gaugeShare ? Number(this.gaugeShare.balance) * Number(this.price) : 0;
            console.log(this.gaugeShare);
        },
        async joinPool() {
            // Before joining our Safe address should be whitelisted
            //
        },
    },
});
</script>

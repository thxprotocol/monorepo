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
                <b-card>
                    <div class="mb-3" v-if="!pool">
                        <b-placeholder cols="12" size="lg" class="mb-1" animation="glow" />
                        <b-placeholder cols="12" size="lg" class="mb-2" animation="glow" />
                        <b-placeholder cols="5" size="xs" class="mb-3" animation="glow" />
                        <b-placeholder cols="12" size="lg" class="mb-1" animation="glow" />
                        <b-placeholder cols="12" size="lg" class="mb-2" animation="glow" />
                        <b-placeholder cols="10" size="xs" class="mb-3" animation="glow" />
                        <hr />
                        <b-placeholder cols="12" animation="glow" />
                        <b-placeholder cols="12" animation="glow" />
                    </div>
                    <b-form v-else class="mb-3">
                        <b-form-group v-for="(token, key) of tokens" class="mb-3">
                            <div class="d-flex align-items-center justify-content-between">
                                <b-badge
                                    class="p-2 d-flex align-items-center"
                                    variant="primary"
                                    style="font-size: 1rem; font-weight: normal"
                                >
                                    <b-img
                                        width="23"
                                        class="rounded-circle me-2"
                                        :src="`${imgTokensUrl}${token.address}.png`"
                                        :title="token.name"
                                        v-b-tooltip
                                    />
                                    <small class="text-opaque">{{ Number(token.weight) * 100 }}%</small>
                                </b-badge>
                                <b-form-input
                                    min="0"
                                    :max="Math.floor(token.myBalance)"
                                    class="ms-3"
                                    type="number"
                                    v-model="amounts[key]"
                                />
                            </div>
                            <div class="d-flex mb-1 justify-content-between mt-1 text-opaque">
                                <div>
                                    Balance: {{ token.myBalance }}
                                    <span v-if="amounts[key] >= Math.floor(token.myBalance)" class="text-muted">
                                        Maxed
                                    </span>
                                </div>
                                <span> {{ toFiat(Number(amounts[key]) * token.token.latestUSDPrice) }} </span>
                            </div>
                            <b-progress
                                variant="success"
                                :value="amounts[key]"
                                :max="Math.floor(token.myBalance)"
                                style="height: 5px"
                            />
                        </b-form-group>
                        <hr />
                        <div class="d-flex justify-content-between">
                            Total:
                            <strong>{{ preview ? toFiat(fromWei(preview.expectedBPTOut) * price) : '$0.00' }}</strong>
                        </div>
                        <div class="d-flex justify-content-between">
                            Price impact:
                            <strong>
                                {{ preview ? Math.floor(fromWei(String(preview.priceImpact * 100)) * 100) / 100 : 0 }}%
                            </strong>
                        </div>
                    </b-form>
                    <b-button class="w-100" :disabled="!pool" @click="joinPool" variant="primary"> Invest </b-button>
                </b-card>
            </b-col>
        </b-row>
        <h2>Investments</h2>
        <BTable responsive="lg" :items="investments" show-empty>
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
        </BTable>
        <h2 class="mt-5">Rewards</h2>
        <BTable responsive="lg" show-empty :items="rewards">
            <template #cell(image)="{ item }">
                <b-img width="23" class="rounded-circle" :src="item.image" />
            </template>
            <template #cell(amount)="{ item }">
                {{ item.amount }}
            </template>
            <template #head(action)></template>
            <template #cell(action)>
                <b-button variant="primary" size="sm" disabled>Claim!</b-button>
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
import { fromWei, toWei } from 'web3-utils';
import { chainList } from '../../utils/chains';
import { getModal } from '../../utils/wallet-connect';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { GetAccountResult, PublicClient, getAccount, sendTransaction } from '@wagmi/core';
import { Web3Modal } from '@web3modal/html';
import {
    BALANCER_POOL_ID,
    BAL_MAINNET_ADDRESS,
    BAL_POLYGON_ADDRESS,
    USDC_POLYGON_ADDRESS,
    liquidityGaugeIds,
} from '../../config/constants';

const config: BalancerSdkConfig = {
    network: Network.POLYGON,
    rpcUrl: 'https://polygon-rpc.com',
};
const balancer = new BalancerSDK(config);

function toFiat(amount: number | string) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    });
    return formatter.format(Number(amount));
}

export default defineComponent({
    name: 'Earn',
    components: {},
    data(): { pool: Pool | null; modal: Web3Modal | null; account: GetAccountResult<PublicClient> | null } & any {
        return {
            fromWei,
            toFiat,
            imgLogo,
            imgTokensUrl: 'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/',
            account: null,
            pool: null,
            apr: 0,
            poolShare: 0,
            poolBalanceUSD: 0,
            gaugeShare: 0,
            gaugeBalanceUSD: 0,
            balRewards: [],
            balances: [0, 0],
            balPrice: 0,
            amounts: { 0: '0', 1: '0' },
            modal: null,
            unsubscribe: null,
            isModalOpen: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
        rewards() {
            return this.balRewards.map((balReward: number) => {
                const amount = fromWei(String(balReward));
                return {
                    image: this.imgTokensUrl + `${BAL_MAINNET_ADDRESS}.png`,
                    amount,
                    value: toFiat(Number(amount) * Number(this.balPrice)),
                    action: balReward,
                };
            });
        },
        investments() {
            if (!this.pool) return [];
            const poolBalanceUSD =
                this.gaugeShare && this.price ? Number(this.poolShare.balance) * Number(this.price) : 0;
            const gaugeBalanceUSD =
                this.gaugeShare && this.price ? Number(this.gaugeShare.balance) * Number(this.price) : 0;
            return [
                {
                    tokens: this.pool.tokens,
                    apr: this.apr ? `${this.apr.min / 100}%-${this.apr.max / 100}%` : '0%',
                    myValue: toFiat(poolBalanceUSD + gaugeBalanceUSD),
                    poolValue: toFiat(this.pool.totalLiquidity),
                },
            ];
        },
        tokens() {
            if (!this.pool) return [];
            return this.pool.tokens.map((token: any, index: number) => {
                const myBalance = this.balances[index] ? fromWei(String(this.balances[index])) : 0;
                return { ...token, myBalance };
            });
        },
        preview() {
            if (!this.pool || (!Number(this.amounts['0']) && !Number(this.amounts['1']))) return;
            return this.pool.buildJoin(
                this.walletStore.wallet.address,
                this.pool.tokenAddresses,
                [toWei(String(this.amounts['0'])), toWei(String(this.amounts['1']))],
                toWei('0'),
            );
        },
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet: TWallet) {
                this.onWalletReady(wallet.address);
            },
            deep: true,
        },
    },
    async mounted() {
        this.getBALPrice();

        const pool = await balancer.pools.find(BALANCER_POOL_ID);
        if (!pool) return;
        this.pool = pool;

        if (this.walletStore.wallet) {
            this.onWalletReady(this.walletStore.wallet.address);
        }

        balancer.pools.apr(pool as Pool).then((apr) => (this.apr = apr));
        balancer.pools.liquidityService.getBptPrice(pool).then((price) => (this.price = price));

        const { chain } = chainList[ChainId.Polygon];
        this.modal = getModal(chain, [chain]);
        this.unsubscribe = this.modal.subscribeModal(this.onModalStateChange);
    },
    methods: {
        // Invoked when wallet is ready and on mounted
        onWalletReady(address: string) {
            this.getBalances(address);
            this.getPoolShare(address);
            this.getGaugeShare(address);
            this.getRewards(address);
        },
        // Gets the balancers for the available pool tokens
        async getBalances(walletAddress: string) {
            if (!this.pool) return;
            this.balances = await Promise.all(
                this.pool.tokenAddresses.map(async (tokenAddress: string) => {
                    const contract = balancer.contracts.ERC20(tokenAddress, balancer.provider);
                    return await contract.balanceOf(walletAddress);
                }),
            );
        },
        // Gets the BAL price in order to calc the BAL rewards value
        async getBALPrice() {
            this.balPrice = await balancer.pricing.getSpotPrice(USDC_POLYGON_ADDRESS, BAL_POLYGON_ADDRESS);
        },
        // Other token rewards (does not include Polygon POS incentives for some reason)
        async getRewards(walletAddress: string) {
            // TODO Should query for pool tokens for user and work from there
            this.balRewards = await Promise.all(
                liquidityGaugeIds.map(async (id) => {
                    const contract = balancer.contracts.liquidityGauge(id, balancer.provider);
                    return await contract.claimable_reward(walletAddress.toLowerCase(), BAL_POLYGON_ADDRESS);
                }),
            );
        },
        // Unstaked
        async getPoolShare(walletAddress: string) {
            const poolShares = await balancer.data.poolShares.findByUser(walletAddress.toLowerCase());
            this.poolShare = poolShares?.find((share) => share.poolId === BALANCER_POOL_ID);
            console.log(this.poolShare);
        },
        // Staked
        async getGaugeShare(walletAddress: string) {
            const gaugeShares = await balancer.data.gaugeShares?.findByUser(walletAddress.toLowerCase());
            this.gaugeShare = gaugeShares?.find((share) => share.gauge.poolId === BALANCER_POOL_ID);
            console.log(this.gaugeShare);
        },
        onModalStateChange({ open }: { open: boolean }) {
            this.isModalOpen = open;
            this.account = getAccount();
        },
        waitForConnected() {
            return new Promise((resolve) => {
                setInterval(() => {
                    if (this.account?.isConnected) resolve('connected');
                }, 500);
            });
        },
        async joinPool() {
            if (!this.modal) return;

            this.error = '';
            this.isSubmitting = true;

            try {
                const { chain } = chainList[ChainId.Polygon];
                this.modal.setDefaultChain(chain);
                await this.modal.openModal();
                await this.waitForConnected();

                const result = await sendTransaction({
                    to: this.pool.address,
                    data: this.preview.data,
                    chainId: ChainId.Polygon,
                });
                console.log(result);
                debugger;
            } catch (error) {
                this.error = error as string;
                this.modal.closeModal();
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>
<style scoped>
.form-control,
.form-control:focus {
    border-color: var(--bs-primary);
}
.progress {
    background-color: var(--bs-primary);
}
</style>
<style>
.placeholder {
    border-radius: 3px !important;
}
</style>

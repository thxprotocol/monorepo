<template>
    <b-button
        v-if="balanceBPT"
        class="rounded w-100 d-flex align-items-center justify-content-between"
        variant="primary"
        @click="onClickCollapse"
    >
        1. Add Liquidity
        <i
            class="fas ms-auto"
            :class="{
                'fa-chevron-down': isCollapseCreateLiquidityOpen,
                'fa-chevron-up': !isCollapseCreateLiquidityOpen,
            }"
        />
    </b-button>
    <b-collapse v-model="isCollapseCreateLiquidityOpen" class="pt-3">
        <BaseFormGroupInputTokenAmount
            :usd="liquidityStore.pricing['USDC']"
            :balance="balanceUSDC"
            :value="Number(amountUSDC)"
            :min="0"
            :max="balanceUSDC"
            class="mb-4"
            @update="amountUSDC = $event"
        >
            <template #label>
                <div class="d-flex align-items-center" style="width: 70px">
                    <b-img
                        src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                        alt="USDC icon"
                        width="20"
                        height="20"
                        class="me-2"
                    />
                    USDC
                </div>
            </template>
        </BaseFormGroupInputTokenAmount>
        <BaseFormGroupInputTokenAmount
            :usd="liquidityStore.pricing['THX']"
            :balance="balanceTHX"
            :value="Number(amountTHX)"
            :min="0"
            :max="balanceTHX"
            class="mb-4"
            @update="amountTHX = $event"
        >
            <template #label>
                <div class="d-flex align-items-center" style="width: 70px">
                    <b-img
                        src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                        alt="THX icon"
                        width="20"
                        height="20"
                        class="me-2"
                    />
                    THX
                </div>
            </template>
        </BaseFormGroupInputTokenAmount>
        <b-button
            v-if="!accountStore.isAuthenticated"
            class="w-100"
            variant="primary"
            @click="authStore.isModalLoginShown = true"
        >
            Sign in &amp; Add Liquidity
        </b-button>
        <b-button v-else class="w-100" variant="primary" @click="isModalCreateLiquidityShown = true">
            Add Liquidity
        </b-button>
    </b-collapse>
    <BaseModalCreateLiquidity
        :show="isModalCreateLiquidityShown"
        :amounts="[amountUSDC, amountTHX]"
        @submit="onSubmitCreateLiquidity"
        @hidden="isModalCreateLiquidityShown = false"
    />
    <template v-if="balanceBPT">
        <hr />
        <b-button
            class="rounded w-100 d-flex align-items-center justify-content-between"
            variant="primary"
            @click="onClickCollapse"
        >
            <span>
                2. Stake Liquidity
                <i
                    v-b-tooltip
                    class="fas fa-info-circle ms-1"
                    title="You have unstaked liquidity! You can only lock and obtain veTHX after staking the provided liquidity."
                />
            </span>
            <i
                class="fas ms-auto"
                :class="{
                    'fa-chevron-down': isCollapseStakeLiquidityOpen,
                    'fa-chevron-up': !isCollapseStakeLiquidityOpen,
                }"
            />
        </b-button>
        <b-collapse v-model="isCollapseStakeLiquidityOpen" class="pt-3">
            <BaseFormGroupInputTokenAmount
                :usd="liquidityStore.pricing['20USDC-80THX']"
                :balance="balanceBPT"
                :value="Number(amountStake)"
                :min="0"
                :max="balanceBPT"
                class="mb-4"
                @update="amountStake = $event"
            >
                <template #label>
                    <div class="d-flex align-items-center">
                        <b-img
                            src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                            alt="USDC icon"
                            width="20"
                            height="20"
                            class="me-2"
                        />
                        USDC <span class="text-opaque ms-1">20%</span>
                        <b-img
                            src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                            alt="THX icon"
                            width="20"
                            height="20"
                            class="mx-2"
                        />
                        THX <span class="text-opaque ms-1">80%</span>
                    </div>
                </template>
            </BaseFormGroupInputTokenAmount>
            <b-button
                :disabled="!amountStake"
                class="w-100"
                :variant="!amountStake ? 'primary' : 'success'"
                @click="isModalStakeShown = true"
            >
                Stake Liquidity
            </b-button>
            <BaseModalStake
                :show="isModalStakeShown"
                :amount="amountStake"
                @staked="onStaked"
                @hidden="isModalStakeShown = false"
            />
        </b-collapse>
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { formatUnits } from 'ethers/lib/utils';
import { useAuthStore } from '@thxnetwork/campaign/stores/Auth';

export default defineComponent({
    name: 'BaseTabLiquidity',
    data() {
        return {
            formatUnits,
            isCollapseCreateLiquidityOpen: true,
            isCollapseStakeLiquidityOpen: false,
            isModalCreateLiquidityShown: false,
            isModalStakeShown: false,
            amountUSDC: '0',
            amountTHX: '0',
            amountStake: '0',
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        balanceUSDC() {
            if (!this.walletStore.balances[this.address.USDC]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.USDC], 'ether'));
        },
        balanceTHX() {
            if (!this.walletStore.balances[this.address.THX]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.THX], 'ether'));
        },
        balanceBPT() {
            if (!this.walletStore.balances[this.address.BPT]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPT], 'ether'));
        },
    },
    watch: {
        'walletStore.wallet'(wallet) {
            if (!wallet) return;
            this.updateBalances();
        },
    },
    methods: {
        onClickCollapse() {
            this.isCollapseStakeLiquidityOpen = !this.isCollapseStakeLiquidityOpen;
            this.isCollapseCreateLiquidityOpen = !this.isCollapseCreateLiquidityOpen;
        },
        updateBalances() {
            this.walletStore.getBalance(this.address.USDC).then(() => {
                this.amountUSDC = formatUnits(this.walletStore.balances[this.address.USDC], 'ether');
            });
            this.walletStore.getBalance(this.address.THX).then(() => {
                this.amountTHX = formatUnits(this.walletStore.balances[this.address.THX], 'ether');
            });
            this.walletStore.getBalance(this.address.BPT).then(() => {
                this.amountStake = formatUnits(this.walletStore.balances[this.address.BPT], 'ether');
            });
        },
        onSubmitCreateLiquidity() {
            this.isCollapseCreateLiquidityOpen = false;
            this.isCollapseStakeLiquidityOpen = true;
            this.isModalCreateLiquidityShown = false;
            this.amountUSDC = '0';
            this.amountTHX = '0';
            this.updateBalances();
        },
        onStaked() {
            this.isCollapseCreateLiquidityOpen = true;
            this.isCollapseStakeLiquidityOpen = false;
            this.isModalStakeShown = false;
            this.amountStake = '0';
            this.updateBalances();
            this.$emit('change-tab', 1);
        },
    },
});
</script>

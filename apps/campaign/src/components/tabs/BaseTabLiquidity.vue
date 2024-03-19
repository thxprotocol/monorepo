<template>
    <BaseFormGroupInputTokenAmount
        :usd="liquidityStore.pricing['USDC']"
        :balance="balanceUSDC"
        :value="amountUSDC"
        :min="0"
        :max="balanceUSDC"
        class="mb-4"
        disabled
        @update="amountUSDC = $event"
    >
        <template #label>
            <div class="d-flex align-items-center" style="width: 65px">
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
        :value="amountTHX"
        :min="0"
        :max="balanceTHX"
        class="mb-4"
        disabled
        @update="amountTHX = $event"
    >
        <template #label>
            <div class="d-flex align-items-center" style="width: 65px">
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
    <b-button disabled class="w-100" variant="primary"> Create Liquidity </b-button>

    <hr />

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

export default defineComponent({
    name: 'BaseTabLiquidity',
    data() {
        return {
            formatUnits,
            amountUSDC: 0,
            amountTHX: 0,
            isModalStakeShown: false,
            amountStake: '0',
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
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

            this.updateAmountStake();
        },
    },
    methods: {
        updateAmountStake() {
            this.walletStore.getBalance(this.address.BPT).then(() => {
                this.amountStake = formatUnits(this.walletStore.balances[this.address.BPT], 'ether');
            });
        },
        onStaked() {
            this.isModalStakeShown = false;
            this.updateAmountStake();
            this.$emit('change-tab', 1);
        },
    },
});
</script>

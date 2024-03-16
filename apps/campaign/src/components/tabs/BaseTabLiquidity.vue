<template>
    <BaseFormGroupInputTokenAmount
        :usd="liquidityStore.pricing['USDC']"
        :balance="walletStore.balances[address.USDC]"
        :value="amountUSDC"
        :min="0"
        :max="walletStore.balances[address.USDC]"
        class="mb-4"
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
        :balance="walletStore.balances[address.THX]"
        :value="amountTHX"
        :min="0"
        :max="walletStore.balances[address.THX]"
        class="mb-4"
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
        :balance="walletStore.balances[address.BPT]"
        :value="amountStake"
        :min="0"
        :max="walletStore.balances[address.BPT]"
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
    <BaseModalStake :show="isModalStakeShown" :amount="amountStake" @hidden="isModalStakeShown = false" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { format } from 'date-fns';
import { contractNetworks } from '../../config/constants';
import { fromWei } from 'web3-utils';
import { ChainId } from '@thxnetwork/sdk';

export default defineComponent({
    name: 'BaseTabLiquidity',
    data() {
        return {
            fromWei,
            format,
            isModalStakeShown: false,
            amountStake: 0,
            amountUSDC: 0,
            amountTHX: 0,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
    },
    watch: {
        'walletStore.wallet'(wallet) {
            if (!wallet) return;

            this.walletStore.getBalance(this.address.BPT).then(() => {
                this.amountStake = this.walletStore.balances[this.address.BPT];
            });
        },
    },
});
</script>

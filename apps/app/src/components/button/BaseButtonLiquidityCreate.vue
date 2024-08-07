<template>
    <b-button :disabled="isDisabled" variant="success" :size="size" class="w-100" @click="onClick">
        <b-spinner v-if="isPolling" small />
        <template v-else> <slot /> </template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { BigNumber } from 'ethers/lib/ethers';
import { useWalletStore } from '@thxnetwork/app/stores/Wallet';
import { mapStores } from 'pinia';
import { BALANCER_POOL_ID, contractNetworks } from '@thxnetwork/app/config/constants';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { POLYGON_RPC } from '@thxnetwork/app/config/secrets';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { useAccountStore } from '@thxnetwork/app/stores/Account';
import { useVeStore } from '@thxnetwork/app/stores/VE';
import { ChainId } from '@thxnetwork/common/enums';

export default defineComponent({
    name: 'BaseButtonLiquidityCreate',
    props: {
        size: { type: String as PropType<'sm'> | null, default: null },
        amounts: { type: Array as PropType<string[]>, required: true },
        tokens: { type: Object as PropType<string[]>, required: true },
        slippage: { type: Number, required: true },
    },
    data() {
        return {
            isPolling: false,
        };
    },
    computed: {
        ...mapStores(useVeStore, useWalletStore, useLiquidityStore, useAccountStore),
        address() {
            return contractNetworks[this.liquidityStore.chainId];
        },
        balanceUSDC() {
            return BigNumber.from(this.walletStore.balances[this.address.USDC]);
        },
        balanceTHX() {
            return BigNumber.from(this.walletStore.balances[this.address.THX]);
        },
        isDisabled() {
            const usdcAmountInWei = BigNumber.from(this.amounts[0]);
            const thxAmountInWei = BigNumber.from(this.amounts[1]);
            return (
                this.isPolling ||
                !this.veStore.isAccepted ||
                this.balanceUSDC.lt(usdcAmountInWei) ||
                this.balanceTHX.lt(thxAmountInWei) ||
                (this.balanceUSDC.eq(0) && this.balanceTHX.eq(0))
            );
        },
    },
    methods: {
        async onClick() {
            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Pleas connect a wallet!');

                this.isPolling = true;

                // Check current chainId to be Hardhat or Polygon
                if (![ChainId.Hardhat, ChainId.Polygon].includes(this.walletStore.chainId)) {
                    throw new Error('Please, change your network to Polygon');
                }

                // Create Balancer SDK here in favor of code splitting on /earn
                const balancer = new BalancerSDK({
                    network: Network.POLYGON,
                    rpcUrl: POLYGON_RPC,
                });
                const pool = await balancer.pools.find(BALANCER_POOL_ID);
                if (!pool) throw new Error('Liquidity pool not found');

                // Values to send
                const usdcAmountInWei = this.amounts[0];
                const thxAmountInWei = this.amounts[1];
                const slippage = String(Number(this.slippage.toFixed(2)) * 100);

                // Create liquidity
                const data = { usdcAmountInWei, thxAmountInWei, slippage, pool };
                await this.liquidityStore.createLiquidity(wallet, data);

                this.$emit('success');
            } catch (error) {
                this.$emit('error', error);
            } finally {
                this.isPolling = false;
            }
        },
    },
});
</script>

<template>
    <b-button :disabled="isDisabled" variant="success" size="sm" class="w-100" @click="onClick">
        <b-spinner v-if="isPolling" small />
        <template v-else> Add Liquidity </template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { BigNumber } from 'ethers/lib/ethers';
import { useWalletStore } from '@thxnetwork/campaign/stores/Wallet';
import { mapStores } from 'pinia';
import { BALANCER_POOL_ID, contractNetworks } from '@thxnetwork/campaign/config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { POLYGON_RPC } from '@thxnetwork/campaign/config/secrets';
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';

export default defineComponent({
    name: 'BaseButtonLiquidityCreate',
    props: {
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
        ...mapStores(useWalletStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        balanceUSDC() {
            return BigNumber.from(this.walletStore.balances[this.address.USDC]);
        },
        balanceTHX() {
            return BigNumber.from(this.walletStore.balances[this.address.THX]);
        },
        isDisabled() {
            return this.isPolling;
        },
    },
    methods: {
        async onClick() {
            try {
                if (!this.walletStore.wallet) throw new Error('Pleas connect a wallet!');

                this.isPolling = true;

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
                await this.liquidityStore.createLiquidity(this.walletStore.wallet, data);

                // Wait for BPTGauge balance to increase
                await this.liquidityStore.waitForLiquidity(this.walletStore.wallet, data);

                this.$emit('success');
            } catch (error) {
                console.error(error);
            } finally {
                this.isPolling = false;
            }
        },
    },
});
</script>

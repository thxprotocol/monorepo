<template>
    <b-button :disabled="isDisabled" variant="success" size="sm" class="w-100" @click="onClick">
        <b-spinner v-if="isPolling" small />
        <template v-else> Stake Liquidity </template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { BigNumber } from 'ethers/lib/ethers';
import { useWalletStore } from '@thxnetwork/campaign/stores/Wallet';
import { mapStores } from 'pinia';
import { contractNetworks } from '@thxnetwork/campaign/config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';

export default defineComponent({
    name: 'BaseButtonLiquidityStake',
    props: {
        amount: { type: String, required: true },
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
        amountInWei() {
            return BigNumber.from(this.amount);
        },
        balanceBPT() {
            return BigNumber.from(this.walletStore.balances[this.address.USDC]);
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

                // Make deposit
                await this.liquidityStore.stake({ amountInWei: this.amountInWei.toString() });

                // Wait for BPTGauge balance to increase
                await this.liquidityStore.waitForStake(this.amountInWei);

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

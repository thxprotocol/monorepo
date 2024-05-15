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
import { contractNetworks } from '@thxnetwork/app/config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';

export default defineComponent({
    name: 'BaseButtonLiquidityStake',
    props: {
        size: { type: String as PropType<'sm'> | null, default: null },
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
            return BigNumber.from(this.walletStore.balances[this.address.BPT]);
        },
        isDisabled() {
            return this.balanceBPT.lt(this.amountInWei) || this.isPolling;
        },
    },
    methods: {
        async onClick() {
            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Pleas connect a wallet!');

                this.isPolling = true;

                await this.liquidityStore.stake(wallet, { amountInWei: this.amountInWei.toString() });
                await this.liquidityStore.waitForStake(wallet, this.amountInWei);

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

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
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { mapStores } from 'pinia';
import { useVeStore } from '@thxnetwork/app/stores/VE';
import { useAccountStore } from '@thxnetwork/app/stores/Account';
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/common/enums';

export default defineComponent({
    name: 'BaseButtonLiquidityLock',
    props: {
        size: { type: String as PropType<'sm'> | null, default: null },
        amount: { type: String, required: true },
        lockEnd: { type: Date, required: true },
    },
    data() {
        return {
            isPolling: false,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useAccountStore, useLiquidityStore),
        address() {
            return contractNetworks[this.liquidityStore.chainId];
        },
        amountInWei() {
            return BigNumber.from(this.amount);
        },
        balanceBPTGauge() {
            return BigNumber.from(this.walletStore.balances[this.address.BPTGauge]);
        },
        isDisabled() {
            return (
                this.isPolling ||
                !this.veStore.isAccepted ||
                this.balanceBPTGauge.lt(this.amountInWei) ||
                this.amountInWei.eq(0)
            );
        },
    },
    methods: {
        async onClick() {
            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet!');

                this.isPolling = true;

                // Check current chainId to be Hardhat or Polygon
                if (![ChainId.Hardhat, ChainId.Polygon].includes(this.walletStore.chainId)) {
                    throw new Error('Please, change your network to Polygon');
                }

                const lockEndTimestamp = Math.ceil(new Date(this.lockEnd).getTime() / 1000);
                const data = { amountInWei: this.amountInWei.toString(), lockEndTimestamp };
                await this.veStore.deposit(wallet, data);

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

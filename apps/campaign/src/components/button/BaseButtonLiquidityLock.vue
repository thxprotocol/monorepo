<template>
    <b-button :disabled="isDisabled" variant="success" :size="size" class="w-100" @click="onClick">
        <b-spinner v-if="isPolling" small />
        <template v-else> <slot /> </template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { BigNumber } from 'ethers/lib/ethers';
import { useWalletStore } from '@thxnetwork/campaign/stores/Wallet';
import { mapStores } from 'pinia';
import { useVeStore } from '@thxnetwork/campaign/stores/VE';

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
        ...mapStores(useWalletStore, useVeStore),
        amountInWei() {
            return BigNumber.from(this.amount);
        },
        isDisabled() {
            return this.isPolling;
        },
    },
    methods: {
        async onClick() {
            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet!');

                this.isPolling = true;

                const lockEndTimestamp = Math.ceil(new Date(this.lockEnd).getTime() / 1000);
                await this.veStore.deposit(wallet, { amountInWei: this.amountInWei.toString(), lockEndTimestamp });
                await this.veStore.waitForLock(wallet, this.amountInWei, lockEndTimestamp);

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

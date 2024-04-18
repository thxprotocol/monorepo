<template>
    <b-button :disabled="isDisabled" variant="success" size="sm" class="w-100" @click="onClick">
        <b-spinner v-if="isPolling" small />
        <template v-else> Lock Liquidity </template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { BigNumber } from 'ethers/lib/ethers';
import { useWalletStore } from '@thxnetwork/campaign/stores/Wallet';
import { mapStores } from 'pinia';
import { useVeStore } from '@thxnetwork/campaign/stores/VE';

export default defineComponent({
    name: 'BaseButtonLock',
    props: {
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
                if (!this.walletStore.wallet) throw new Error('Pleas connect a wallet!');

                this.isPolling = true;

                // Values to send
                const lockEndTimestamp = Math.ceil(new Date(this.lockEnd).getTime() / 1000);

                // Make deposit
                await this.veStore.deposit({ amountInWei: this.amountInWei.toString(), lockEndTimestamp });

                // Wait for amount and/or endDate to be updated if it changed
                await this.veStore.waitForLock(this.amountInWei, lockEndTimestamp);

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

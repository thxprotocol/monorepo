<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="text-accent">Increase lock amount</strong>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <BaseFormGroupLockAmount :value="lockAmount" @update="lockAmount = $event" />
        <b-button variant="primary" class="w-100" :disabled="isPolling" @click="onClickIncreaseAmount">
            <b-spinner v-if="isPolling" small />
            <template v-else>Increase Amount</template>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';
import { BigNumber } from 'ethers/lib/ethers';
import { contractNetworks } from '../../config/constants';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import poll from 'promise-poller';
import { ChainId } from '@thxnetwork/sdk';

export default defineComponent({
    name: 'BaseModalIncreaseAmount',
    props: {
        show: Boolean,
    },
    data() {
        return {
            parseUnits,
            isShown: false,
            error: '',
            isPolling: false,
            lockAmount: 0,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        isAlertInfoShown() {
            return !!this.error;
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        balanceBPTGauge() {
            if (!this.walletStore.balances[this.address.BPTGauge]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPTGauge], 'ether'));
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        async onShow() {
            //
        },
        async waitForIncrease() {
            const taskFn = async () => {
                await this.veStore.getLocks();
                return BigNumber.from(this.veStore.lock.amount).eq(0) ? Promise.resolve() : Promise.reject('x');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async onClickIncreaseAmount() {
            this.isPolling = true;

            try {
                const amountInWei = this.lockAmount;

                await this.veStore.increaseAmount({ amountInWei });
                await this.waitForIncrease();

                this.$emit('hidden');
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            this.error = response && response.error ? response.error.message : 'Something went wrong...';
        },
    },
});
</script>
